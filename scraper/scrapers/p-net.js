const puppeteer = require('puppeteer');
const {
    parseSalary,
    parseJobType,
    parseExperienceLevel,
    parseExperienceYears,
    parseGraduateFriendly,
    parseSkills
} = require('../utils/parser.js');
const crypto = require('crypto');

const generateHash = (title, company, datePosted) => {
    return crypto.createHash('sha256')
        .update(`${title}${company}${datePosted}`)
        .digest('hex');
};


const getJobLinks = async (page) => {
    return await page.$$eval('article[data-testid="job-item"]', cards =>
        cards.map(card => {
            const titleEl = card.querySelector('[data-at="job-item-title"]');
            const locationEl = card.querySelector('[data-at="job-item-location"] .res-du9bhi');
            const timeEl = card.querySelector('time');
            return {
                title: titleEl ? titleEl.textContent.trim() : null,
                location: locationEl ? locationEl.textContent.trim() : null,
                href: titleEl ? titleEl.getAttribute('href') : null,
                datetime: timeEl ? timeEl.getAttribute('datetime') : null,
            };
        })
    );
};

const scrape = async (params) => {
    const limit = params.limit || 25;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    await page.goto(params.url, { waitUntil: 'networkidle2', timeout: 30000 });

    const jobLinks = await getJobLinks(page);
    const limited = jobLinks.slice(0, limit);

    console.log(`Found ${jobLinks.length} jobs on page — processing ${limited.length}...`);

    const jobs = [];

    for (const link of limited) {
        if (!link.href || !link.title) continue;

        const jobUrl = 'https://www.pnet.co.za' + link.href;

        try {
            const detailPage = await browser.newPage();
            await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
            await detailPage.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            const company = await detailPage.$eval('[data-at="metadata-company-name"] .job-ad-display-du9bhi', el => el.textContent.trim()).catch(() => null);
            const location = await detailPage.$eval('[data-at="metadata-location"] .job-ad-display-du9bhi', el => el.textContent.trim()).catch(() => link.location);
            const contractType = await detailPage.$eval('[data-at="metadata-contract-type"] .job-ad-display-du9bhi', el => el.textContent.trim()).catch(() => null);
            const description = await detailPage.$eval('[data-at="section-text-description-content"]', el => el.textContent.trim()).catch(() => null);
            const salaryText = await detailPage.$eval('[data-at="section-text-benefits-content"]', el => el.textContent.trim()).catch(() => null);

            await detailPage.close();

            const datePosted = link.datetime ? link.datetime.split('T')[0] : null;
            const { min: salaryMin, max: salaryMax } = parseSalary(salaryText || '');
            const expYears = parseExperienceYears(description || '');
            const expLevel = parseExperienceLevel(contractType || '', link.title);
            const graduateFriendly = parseGraduateFriendly(description || '', link.title, expLevel, expYears.min);

            jobs.push({
                title: link.title,
                company,
                location,
                salary_min: salaryMin,
                salary_max: salaryMax,
                job_type: contractType || parseJobType(description || ''),
                description,
                url: jobUrl,
                source: 'pnet',
                hash: generateHash(link.title, company, datePosted),
                date_posted: datePosted,
                experience_level: expLevel,
                experience_years_min: expYears.min,
                experience_years_max: expYears.max,
                is_graduate_friendly: graduateFriendly ? 1 : 0,
                skills: parseSkills(description || ''),
            });

            console.log(`✓ ${link.title} @ ${company}`);
        } catch (err) {
            console.log(`✗ Failed: ${jobUrl} — ${err.message}`);
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
    return jobs;
};;

module.exports = { scrape };