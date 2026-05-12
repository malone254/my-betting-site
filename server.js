const express = require('express');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   ENV VARIABLES (Render)
========================= */
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ODDS_API_KEY;
const MONGO_URL = process.env.MONGO_URL;

/* =========================
   MONGO CONNECTION (optional)
========================= */
if (MONGO_URL) {
  mongoose.connect(MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Mongo Error:", err.message));
}

/* =========================
   BET MODEL
========================= */
const BetSchema = new mongoose.Schema({
  bets: Array,
  stake: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Bet = mongoose.model("Bet", BetSchema);

/* =========================
   PAGES ROUTES
========================= */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/live', (req, res) => {
  res.sendFile(path.join(__dirname, 'live.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

/* =========================
   ODDS API (REAL MATCHES)
========================= */
app.get('/api/matches', async (req, res) => {
  try {

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h`;

    const response = await axios.get(url);

    res.json(response.data);

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

/* =========================
   BET SYSTEM
========================= */
app.post('/api/bet', async (req, res) => {
  try {

    const bet = new Bet(req.body);
    await bet.save();

    res.json({ message: "Bet placed successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Get all bets (for testing/admin) */
app.get('/api/bets', async (req, res) => {
  const bets = await Bet.find().sort({ createdAt: -1 });
  res.json(bets);
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
