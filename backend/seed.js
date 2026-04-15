const pool = require('./db.js');
const fs = require('fs');

const seedJobs = async () => {
    const jobs = JSON.parse(fs.readFileSync('../scraper/data.json', 'utf8'));
    console.log(`Found ${jobs.length} jobs to seed`);

    let inserted = 0;
    let skipped = 0;

    for (const job of jobs) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Check for duplicate using hash
            const [existing] = await conn.query(
                'SELECT id FROM jobs WHERE hash = ?', [job.hash]
            );

            if (existing.length > 0) {
                skipped++;
                await conn.rollback();
                continue;
            }

            // Insert job
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

            // Insert skills and link to job
            for (const skillName of job.skills) {
                // Insert skill if it doesn't exist
                await conn.query(
                    'INSERT IGNORE INTO skills (name) VALUES (?)',
                    [skillName]
                );

                // Get skill id
                const [skill] = await conn.query(
                    'SELECT id FROM skills WHERE name = ?',
                    [skillName]
                );

                // Link skill to job
                await conn.query(
                    'INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?)',
                    [jobId, skill[0].id]
                );
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

    console.log(`\nDone — ${inserted} inserted, ${skipped} skipped (duplicates)`);
    process.exit(0);
};

seedJobs();