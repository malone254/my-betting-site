const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* Serve frontend */
app.use(express.static("public"));

/* GAME STATE */
let game = {
  multiplier: 1.0,
  crashPoint: 0,
  running: false,
  bets: {},
  history: []
};

/* START GAME */
function startGame() {

  game = {
    multiplier: 1.0,
    crashPoint: parseFloat((Math.random() * 8 + 1.5).toFixed(2)),
    running: true,
    bets: {},
    history: game.history
  };

  console.log("🚀 Crash at:", game.crashPoint);

  io.emit("game_start");

  const interval = setInterval(() => {

    game.multiplier += 0.05;
    game.multiplier = parseFloat(game.multiplier.toFixed(2));

    io.emit("multiplier", game.multiplier);

    /* CRASH */
    if (game.multiplier >= game.crashPoint) {

      clearInterval(interval);

      game.running = false;

      io.emit("crash", game.crashPoint);

      /* save history */
      game.history.unshift(game.crashPoint);
      if (game.history.length > 10) game.history.pop();

      /* restart after 5s */
      setTimeout(startGame, 5000);
    }

  }, 100);

}

/* SOCKET CONNECTION */
io.on("connection", (socket) => {

  console.log("User connected");

  /* send current state */
  socket.emit("multiplier", game.multiplier);
  socket.emit("history", game.history);

  /* CASH OUT */
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

/* START GAME LOOP */
startGame();

/* IMPORTANT: RENDER PORT FIX */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("✅ Aviator running on port " + PORT);
});
