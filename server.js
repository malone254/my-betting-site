const express = require('express');
const path = require('path');

const app = express();

/* 
IMPORTANT:
This allows CSS, JS, images, and HTML to load properly on Render
*/
app.use(express.static(__dirname));

/* =========================
   ROUTES (PAGES)
========================= */

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Live betting page
app.get('/live', (req, res) => {
  res.sendFile(path.join(__dirname, 'live.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

// Dashboard page (optional but ready)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Deposit page (optional)
app.get('/deposit', (req, res) => {
  res.sendFile(path.join(__dirname, 'deposit.html'));
});

// Withdraw page (optional)
app.get('/withdraw', (req, res) => {
  res.sendFile(path.join(__dirname, 'withdraw.html'));
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MaloneBet running on port ${PORT}`);
});
