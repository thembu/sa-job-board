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



// Extract experience years from description like "3-5 years"
const parseExperienceYears = (descriptionStr) => {
    if (!descriptionStr) return { min: null, max: null };
    const match = descriptionStr.match(/(\d+)\s*[-–to]+\s*(\d+)\s*years?/i);
    if (match) return { min: parseInt(match[1]), max: parseInt(match[2]) };
    const singleMatch = descriptionStr.match(/(\d+)\+?\s*years?/i);
    if (singleMatch) return { min: parseInt(singleMatch[1]), max: null };
    return { min: null, max: null };
};

const parseExperienceLevel = (positionStr, titleStr) => {
    // Check title first — it's more reliable
    const title = titleStr.toLowerCase();
    if (title.includes('senior') || title.includes('lead') || title.includes('expert') || title.includes('principal')) return 'senior';
    if (title.includes('intermediate') || title.includes('mid-level') || title.includes('mid level')) return 'intermediate';
    if (title.includes('junior') || title.includes('jr ')) return 'junior';
    if (title.includes('graduate') || title.includes('intern')) return 'graduate';

    // Fall back to position string only if title has no level info
    const position = positionStr ? positionStr.toLowerCase() : '';
    if (position.includes('senior') || position.includes('lead')) return 'senior';
    if (position.includes('intermediate')) return 'intermediate';
    if (position.includes('junior')) return 'junior';
    if (position.includes('graduate') || position.includes('entry')) return 'graduate';

    return null;
};

const parseGraduateFriendly = (descriptionStr, experienceLevel) => {
    if (experienceLevel === 'senior' || experienceLevel === 'intermediate') return false;
    if (experienceLevel === 'graduate') return true;
    if (!descriptionStr) return false;
    const lower = descriptionStr.toLowerCase();
    return lower.includes('no experience required') || 
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

module.exports = {
    parseSalary,
    parseJobType,
    parseExperienceLevel,
    parseExperienceYears,
    parseGraduateFriendly,
    parseSkills
}