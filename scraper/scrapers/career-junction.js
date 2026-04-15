const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config.js')
const {
    parseSalary,
    parseJobType,
    parseExperienceLevel,
    parseExperienceYears,
    parseGraduateFriendly,
    parseSkills
} = require('../utils/parser.js');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-ZA,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};





// Generate deduplication hash
const generateHash = (title, company, datePosted) => {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
        .update(`${title}${company}${datePosted}`)
        .digest('hex');
};


// Build URL from config




const scrape = async (params) => {

    const url = new URL('https://www.careerjunction.co.za/jobs/results');
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));


    const { data } = await axios.get(url.toString(), { headers });
    const page = cheerio.load(data);

    const jobs = [];

    page('.module.job-result').each((i, el) => {
        const card = page(el);
        const href = card.find('.show-more').attr('href');
        if (!href) return;

        const salaryStr = card.find('.salary').text().trim();
        const positionStr = card.find('.position').text().trim();
        const updatedTime = card.find('.updated-time').text().trim();

        // Parse date from "Posted 14 Apr 2026"
        const dateMatch = updatedTime.match(/Posted\s+(.+)/i);
        const datePosted = dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] : null;

        const { min: salaryMin, max: salaryMax } = parseSalary(salaryStr);

        jobs.push({
            title: null,
            company: null,
            company_url: 'https://www.careerjunction.co.za' + (card.find('.job-result-logo a').attr('href') || ''),
            position: positionStr,
            location: card.find('.location').text().trim(),
            salary: salaryStr,
            salary_min: salaryMin,
            salary_max: salaryMax,
            job_type: parseJobType(positionStr),
            updated_time: updatedTime,
            date_posted: datePosted,
            expires: card.find('.expires').text().trim(),
            job_ref: card.find('.cjun-job-ref').text().trim(),
            url: 'https://www.careerjunction.co.za' + href,
            source: 'careerjunction',
            description: null,
            experience_level: null,
            experience_years_min: null,
            experience_years_max: null,
            is_graduate_friendly: false,
            skills: [],
            hash: null,
        });
    });

    // Visit each job detail page
    for (const job of jobs) {
        try {
            const { data: detail } = await axios.get(job.url, { headers, timeout: 10000 });
            const detailPage = cheerio.load(detail);

            job.title = detailPage('.name-wrapper h1').text().trim();
            job.company = detailPage('.name-wrapper h2').text().trim();
            job.description = detailPage('.job-details-description').text().trim();

            // Parse experience from description
            const { min: expMin, max: expMax } = parseExperienceYears(job.description);
            job.experience_years_min = expMin;
            job.experience_years_max = expMax;

            // Parse experience level from position + title
            job.experience_level = parseExperienceLevel(job.position, job.title);

            // Graduate friendly flag
            job.is_graduate_friendly = parseGraduateFriendly(job.description, job.experience_level);

            // Extract skills
            job.skills = parseSkills(job.description);

            // Generate hash for deduplication
            job.hash = generateHash(job.title, job.company, job.date_posted);

            console.log(`✓ ${job.title} @ ${job.company}`);
        } catch (error) {
            console.log(`✗ Failed: ${job.url} — ${error.message}`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    return jobs;
};

module.exports = {scrape}