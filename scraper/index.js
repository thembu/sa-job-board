const { scrape: scrapeCareerJunction } = require('./scrapers/career-junction');
const { scrape: scrapePnet } = require('./scrapers/p-net');
const config = require('./config');
const pool = require('../backend/db');
require('dotenv').config({ path: '../backend/.env' });

const scrapers = {
    careerjunction: scrapeCareerJunction,
    pnet: scrapePnet,
};

const seedJobs = async (jobs) => {
    let inserted = 0;
    let skipped = 0;

    for (const job of jobs) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [existing] = await conn.query(
                'SELECT id FROM jobs WHERE hash = ?', [job.hash]
            );

            if (existing.length > 0) {
                skipped++;
                await conn.rollback();
                continue;
            }

            const [result] = await conn.query(
                `INSERT INTO jobs 
                (title, company, location, salary_min, salary_max, job_type, 
                description, url, source, hash, date_posted, experience_level, 
                experience_years_min, experience_years_max, is_graduate_friendly) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    job.title,
                    job.company,
                    job.location,
                    job.salary_min,
                    job.salary_max,
                    job.job_type,
                    job.description,
                    job.url,
                    job.source,
                    job.hash,
                    job.date_posted,
                    job.experience_level,
                    job.experience_years_min,
                    job.experience_years_max,
                    job.is_graduate_friendly ? 1 : 0
                ]
            );

            const jobId = result.insertId;

            for (const skillName of job.skills) {
                await conn.query('INSERT IGNORE INTO skills (name) VALUES (?)', [skillName]);
                const [skill] = await conn.query('SELECT id FROM skills WHERE name = ?', [skillName]);
                await conn.query('INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?)', [jobId, skill[0].id]);
            }

            await conn.commit();
            inserted++;
            console.log(`✓ Inserted: ${job.title} @ ${job.company}`);

        } catch (error) {
            await conn.rollback();
            console.log(`✗ Failed: ${job.title} — ${error.message}`);
        } finally {
            conn.release();
        }
    }

    return { inserted, skipped };
};

exports.handler = async (event) => {
    try {
        const enabledSources = config.sources.filter(s => s.enabled);

        let totalInserted = 0;
        let totalSkipped = 0;

        for (const source of enabledSources) {
            const scraperFn = scrapers[source.scraper];
            if (!scraperFn) {
                console.log(`✗ No scraper found for: ${source.scraper} — skipping`);
                continue;
            }

            console.log(`Scraping ${source.name} — ${source.params.url || source.params.keywords}...`);
            const jobs = await scraperFn(source.params);
            console.log(`Found ${jobs.length} jobs from ${source.name}`);

            const { inserted, skipped } = await seedJobs(jobs);
            totalInserted += inserted;
            totalSkipped += skipped;
        }

        const result = {
            statusCode: 200,
            body: `Done — ${totalInserted} inserted, ${totalSkipped} skipped`
        };

        console.log(result.body);
        return result;

    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            body: `Error: ${error.message}`
        };
    } finally {
        await pool.end();
    }
};

if (require.main === module) {
    exports.handler().then(result => {
        console.log(result.body);
        process.exit(0);
    });
}