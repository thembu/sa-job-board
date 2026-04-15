module.exports = {
    sources: [
        {
            name: 'careerjunction',
            enabled: true,
            baseUrl: 'https://www.careerjunction.co.za/jobs/results',
            params: {
                Category: 16,        // Information Technology
                Location: 2747,      // Gauteng
                SortBy: 'Relevance',
                lr: 4
            }
        }
        // Future sources get added here:
        // {
        //     name: 'offerzen',
        //     enabled: true,
        //     baseUrl: '...',
        //     params: { ... }
        // }
    ],

    filters: {
        category: 'Information Technology',
        location: 'Gauteng',
    }
}