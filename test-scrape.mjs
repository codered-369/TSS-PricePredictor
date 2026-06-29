import * as cheerio from 'cheerio';

async function testScrape() {
  const url = 'https://www.napanta.com/market-price/karnataka/karwar-uttar-kannad/sirsi';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const results = [];
  $('tr').each((i, row) => {
    const cells = $(row).find('td, th').map((j, cell) => $(cell).text().trim().replace(/\s+/g, ' ').toLowerCase()).get();
    if (cells.length > 0 && cells.some(c => c.includes('arecanut') || c.includes('pepper'))) {
      results.push(cells);
    }
  });

  console.log(JSON.stringify(results, null, 2));
}

testScrape();
