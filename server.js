const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* ✅ FIX: serve correct folder */
app.use(express.static(path.join(__dirname, "public")));

/* ✅ FIX: homepage route */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* optional live page */
app.get("/live", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "live.html"));
});

/* GAME STATE */
let game = {
  multiplier: 1.0,
  crashPoint: 0,
  running: false,
  history: []
};

/* GAME LOOP */
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

/* SOCKET */
io.on("connection", (socket) => {

  socket.emit("multiplier", game.multiplier);
  socket.emit("history", game.history);

  socket.on("cashout", (data) => {

    if (!game.running) return;

    let bet = data.bet || 0;
    if (bet <= 0) return;

    let payout = bet * game.multiplier;

    socket.emit("cashout_success", {
      multiplier: game.multiplier,
      payout: payout
    });

  });

});

/* START GAME */
startGame();

/* ✅ RENDER PORT FIX */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("✅ Aviator running on port " + PORT);
});
