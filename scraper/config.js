module.exports = {
    sources: [
        // ── CareerJunction ──────────────────────────────────────────
        {
            name: 'careerjunction',
            scraper: 'careerjunction',
            enabled: true,
            baseUrl: 'https://www.careerjunction.co.za/jobs/results',
            params: {
                keywords: 'Junior Software Developer',
                autosuggestEndpoint: '/autosuggest',
                location: 16149,
                category: 16,
            }
        },
        {
            name: 'careerjunction',
            scraper: 'careerjunction',
            enabled: true,
            baseUrl: 'https://www.careerjunction.co.za/jobs/results',
            params: {
                keywords: 'Junior Software Developer',
                autosuggestEndpoint: '/autosuggest',
                location: 13131,
                category: 16,
            }
        },
        {
            name: 'careerjunction',
            scraper: 'careerjunction',
            enabled: true,
            baseUrl: 'https://www.careerjunction.co.za/jobs/results',
            params: {
                keywords: 'junior software',
                autosuggestEndpoint: '/autosuggest',
                location: 2747,
                category: 16,
            }
        },
        {
            name: 'careerjunction',
            scraper: 'careerjunction',
            enabled: true,
            baseUrl: 'https://www.careerjunction.co.za/jobs/results',
            params: {
                keywords: 'junior software',
                autosuggestEndpoint: '/autosuggest',
                location: 16149,
                category: 16,
            }
        },
        {
            name: 'careerjunction',
            scraper: 'careerjunction',
            enabled: true,
            baseUrl: 'https://www.careerjunction.co.za/jobs/results',
            params: {
                keywords: 'junior Analyst',
                autosuggestEndpoint: '/autosuggest',
                location: 16149,
                category: '',
            }
        },

        // ── PNet ────────────────────────────────────────────────────
        {
            // Graduate software developers — nationwide
            name: 'pnet',
            scraper: 'pnet',
            enabled: true,
            params: {
                url: 'https://www.pnet.co.za/jobs/graduate-software-developer?searchOrigin=Resultlist_top-search&whatType=autosuggest',
                limit: 25
            }
        },
        {
            // Graduate software developers — Gauteng
            name: 'pnet',
            scraper: 'pnet',
            enabled: true,
            params: {
                url: 'https://www.pnet.co.za/jobs/graduate-software-developer/in-gauteng?radius=30&searchOrigin=Resultlist_top-search',
                limit: 25
            }
        },
        {
            // Graduate software developers — Western Cape
            name: 'pnet',
            scraper: 'pnet',
            enabled: true,
            params: {
                url: 'https://www.pnet.co.za/jobs/graduate-software-developer/in-western-cape?radius=30&searchOrigin=Resultlist_top-search&whereType=autosuggest',
                limit: 25
            }
        },
        {
            // Junior software developers — Gauteng
            name: 'pnet',
            scraper: 'pnet',
            enabled: true,
            params: {
                url: 'https://www.pnet.co.za/jobs/junior-software-developer/in-gauteng?radius=30&searchOrigin=Resultlist_top-search',
                limit: 25
            }
        },
        {
            // Junior software developers — Western Cape
            name: 'pnet',
            scraper: 'pnet',
            enabled: true,
            params: {
                url: 'https://www.pnet.co.za/jobs/junior-software-developer/in-western-cape?radius=30&searchOrigin=Resultlist_top-search&whereType=autosuggest',
                limit: 25
            }
        },
        {
            // Junior business analysts — Gauteng
            name: 'pnet',
            scraper: 'pnet',
            enabled: true,
            params: {
                url: 'https://www.pnet.co.za/jobs/junior-business-analyst/in-gauteng?radius=30&searchOrigin=Resultlist_top-search&whereType=autosuggest',
                limit: 25
            }
        },
    ]
};