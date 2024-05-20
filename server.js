const express = require('express');
const { scrapeGaana } = require('./gaanaScraper');
const { scrapeWynk } = require('./wynkScraper');

const app = express();
const port = 3000;

app.get('/api/gaana', async (req, res) => {
  const trackName = req.query.trackName;
  const artistName = req.query.artistName;

  if (!trackName || !artistName) {
    return res.status(400).json({ error: 'Track name and artist name are required.' });
  }

  const result = await scrapeGaana(trackName, artistName);
  if (result.error) {
    res.status(500).json(result);
  } else {
    res.json(result);
  }
});

app.get('/api/wynk', async (req, res) => {
  const trackName = req.query.trackName;
  const artistName = req.query.artistName;

  if (!trackName || !artistName) {
    return res.status(400).json({ error: 'Track name and artist name are required.' });
  }

  const result = await scrapeWynk(trackName, artistName);
  if (result.error) {
    res.status(500).json(result);
  } else {
    res.json(result);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
