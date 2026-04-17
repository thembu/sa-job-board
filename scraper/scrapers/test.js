// test-pnet.js
const { scrape } = require('./p-net');

(async () => {
    const jobs = await scrape({ url: 'https://www.pnet.co.za/jobs/junior-software-developer/in-parktown?radius=30&searchOrigin=Resultlist_top-search&whereType=autosuggest', limit : 5 });
    require('fs').writeFileSync('pnet-data.json', JSON.stringify(jobs, null, 2));
    console.log(`Done — ${jobs.length} jobs saved to pnet-data.json`);
})();