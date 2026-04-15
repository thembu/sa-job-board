const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const config = requiure('./config.js')


const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-ZA,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};



// Extract salary min/max from string like "R60,000 - R80,000 per month"
const parseSalary = (salaryStr) => {
    if (!salaryStr || salaryStr.includes('Undisclosed')) return { min: null, max: null };
    const numbers = salaryStr.replace(/R|,|\s/g, '').match(/\d+/g);
    if (!numbers || numbers.length < 2) return { min: null, max: null };
    return { min: parseInt(numbers[0]), max: parseInt(numbers[1]) };
};

// Extract job type from position string like "Contract Senior position"
const parseJobType = (positionStr) => {
    if (!positionStr) return null;
    if (positionStr.includes('Permanent')) return 'Permanent';
    if (positionStr.includes('Contract')) return 'Contract';
    if (positionStr.includes('Temporary')) return 'Temporary';
    return null;
};

// Extract experience level from position string
const parseExperienceLevel = (positionStr, titleStr) => {
    const combined = `${positionStr} ${titleStr}`.toLowerCase();
    if (combined.includes('graduate') || combined.includes('entry')) return 'graduate';
    if (combined.includes('junior')) return 'junior';
    if (combined.includes('intermediate')) return 'intermediate';
    if (combined.includes('senior') || combined.includes('lead') || combined.includes('expert')) return 'senior';
    return null;
};

// Extract experience years from description like "3-5 years"
const parseExperienceYears = (descriptionStr) => {
    if (!descriptionStr) return { min: null, max: null };
    const match = descriptionStr.match(/(\d+)\s*[-–to]+\s*(\d+)\s*years?/i);
    if (match) return { min: parseInt(match[1]), max: parseInt(match[2]) };
    const singleMatch = descriptionStr.match(/(\d+)\+?\s*years?/i);
    if (singleMatch) return { min: parseInt(singleMatch[1]), max: null };
    return { min: null, max: null };
};

// Check if job is graduate friendly
const parseGraduateFriendly = (descriptionStr, experienceLevel) => {
    if (experienceLevel === 'graduate') return true;
    if (!descriptionStr) return false;
    const lower = descriptionStr.toLowerCase();
    return lower.includes('graduate') || 
           lower.includes('no experience required') || 
           lower.includes('entry level') ||
           lower.includes('0-1 years') ||
           lower.includes('0 - 1 years');
};

// Extract skills from description
const parseSkills = (descriptionStr) => {
    const knownSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Spring', 'Laravel',
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
        'Git', 'GitHub', 'CI/CD', 'Jenkins', 'Linux',
        'HTML', 'CSS', 'REST', 'GraphQL', 'Kafka', 'RabbitMQ',
        'Agile', 'Scrum', 'DevOps', 'Microservices'
    ];
    if (!descriptionStr) return [];
    return knownSkills.filter(skill => 
        new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(descriptionStr)
    );
};

// Generate deduplication hash
const generateHash = (title, company, datePosted) => {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
        .update(`${title}${company}${datePosted}`)
        .digest('hex');
};


// Build URL from config
const buildUrl = (source) => {
    const params = new URLSearchParams(source.params);
    return `${source.baseUrl}?${params.toString()}`;
}

const enabledSources = config.sources.filter(s => s.enabled);


const scrape = async (url) => {
    const { data } = await axios.get(url, { headers });
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

    fs.writeFileSync('data.json', JSON.stringify(jobs, null, 2));
    console.log(`\nDone — ${jobs.length} jobs scraped`);
};

scrape('https://www.careerjunction.co.za/jobs/results?keywords=junior+software&autosuggestEndpoint=%2Fautosuggest&location=16464&category=16&btnSubmit=+');