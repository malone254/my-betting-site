const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3001;
const ODDS_API_KEY = process.env.ODDS_API_KEY;

// Serve static frontend files
app.use(express.static('public'));
app.use(express.json());

// Function to fetch live odds
async function fetchLiveOdds() {
    try {
        const response = await axios.get(`https://the-odds-api.com`, {
            params: { apiKey: ODDS_API_KEY, regions: 'uk', markets: 'h2h' }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching odds:", error.message);
        return null;
    }
}

// Push live updates to all connected clients every 30 seconds
setInterval(async () => {
    const odds = await fetchLiveOdds();
    if (odds) io.emit('odds-update', odds);
}, 30000);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
