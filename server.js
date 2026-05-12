const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* ✅ Serve static files from root (NOT /public) */
app.use(express.static(__dirname));

/* ✅ Homepage */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ✅ Live page */
app.get("/live", (req, res) => {
  res.sendFile(path.join(__dirname, "live.html"));
});

/* =========================
   AVIATOR GAME ENGINE
========================= */

let game = {
  multiplier: 1.0,
  crashPoint: 0,
  running: false,
  history: []
};

function startGame() {
  game = {
    multiplier: 1.0,
    crashPoint: parseFloat((Math.random() * 8 + 1.5).toFixed(2)),
    running: true,
    history: game.history
  };

  console.log("🚀 Crash at:", game.crashPoint);

  const interval = setInterval(() => {
    game.multiplier += 0.05;
    game.multiplier = parseFloat(game.multiplier.toFixed(2));

    io.emit("multiplier", game.multiplier);

    if (game.multiplier >= game.crashPoint) {
      clearInterval(interval);

      io.emit("crash", game.crashPoint);

      game.running = false;

      game.history.unshift(game.crashPoint);
      if (game.history.length > 10) game.history.pop();

      setTimeout(startGame, 5000);
    }
  }, 100);
}

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("multiplier", game.multiplier);
  socket.emit("history", game.history);

  socket.on("cashout", (data) => {
    if (!game.running) return;

    const bet = Number(data.bet || 0);
    if (bet <= 0) return;

    const payout = bet * game.multiplier;

    socket.emit("cashout_success", {
      multiplier: game.multiplier,
      payout: payout
    });
  });
});

/* START GAME */
startGame();

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("✅ Server running on port " + PORT);
});
