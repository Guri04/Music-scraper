const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scrapeGaana = async (trackName, artistName) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', 
    '--no-gpu',
    '--display=:99',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--incognito',]
  });
  const page = await browser.newPage();

  try {
    await page.setBypassCSP(true);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    await page.goto('https://gaana.com/');
    await delay(3000);

    let buttonSelector = '.input_box';
    try {
      await page.waitForSelector(buttonSelector, { timeout: 5000 });
    } catch (e) {
      buttonSelector = '.ms_btn';
      await page.waitForSelector(buttonSelector, { timeout: 5000 });
    }

    const button = await page.$(buttonSelector);
    await button.evaluate(b => b.scrollIntoView());
    await button.click();

    const searchInputSelector = 'input[type="search"]';
    await page.waitForSelector(searchInputSelector, { timeout: 5000 });

    const searchQuery = `${trackName} ${artistName}`;
    await page.type(searchInputSelector, searchQuery);

    await page.waitForSelector('#scrollpad .card_wrap li:first-child .t_wrap a', { timeout: 5000 });

    const trackData = await page.$eval('#scrollpad .card_wrap li:first-child .t_wrap a', link => {
      return {
        href: link.href,
        title: link.getAttribute('title')
      };
    });

    if (trackData.title.trim().toLowerCase() === trackName.trim().toLowerCase()) {
      return { message: 'Scraping successful', Link: trackData.href, Title: trackData.title };
    } else {
      return { error: `Track name "${trackName}" does not match the title "${trackData.title}".` };
    }
  } catch (error) {
    return { error: error.message };
  } finally {
    await page.close();
    await browser.close();
  }
};

module.exports = { scrapeGaana };
