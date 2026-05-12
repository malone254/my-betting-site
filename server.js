const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

/* HOME PAGE */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* LIVE PAGE (optional later) */
app.get('/live', (req, res) => {
  res.sendFile(path.join(__dirname, 'live.html'));
});

/* API - UPCOMING BIG 5 MATCHES ONLY */
app.get('/api/matches', async (req, res) => {
  try {

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu&markets=h2h,totals&oddsFormat=decimal`;

    const response = await axios.get(url);

    const big5 = [
      "soccer_epl",
      "soccer_spain_la_liga",
      "soccer_germany_bundesliga",
      "soccer_italy_serie_a",
      "soccer_france_ligue_one"
    ];

    const now = new Date();

    const filtered = response.data.filter(match => {
      const start = new Date(match.commence_time);

      // ONLY UPCOMING + BIG 5
      return start > now && big5.includes(match.sport_key);
    });

    res.json(filtered);

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
