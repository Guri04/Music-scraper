const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scrapeWynk = async (trackName, artistName) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--no-gpu',
      '--display=:99',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--incognito',
    ],
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://wynk.in/music/search');

    const searchInputSelector = 'input';
    await page.click(searchInputSelector);
    await page.waitForSelector(searchInputSelector);
    await page.type(searchInputSelector, trackName + ' ' + artistName);

    await page.waitForSelector('[data-testid="searchResultItem"]');
    const trackLinks = await page.$$eval('[data-testid="searchResultItem"] a', links => links.map(link => decodeURIComponent(link.href)));

    return { message: 'Scraping successful', Link: trackLinks[0] };
  } catch (error) {
    return { error: error.message };
  } finally {
    await page.close();
    await browser.close();
  }
};

module.exports = { scrapeWynk };
