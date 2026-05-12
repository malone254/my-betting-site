const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let game = {
  multiplier: 1.0,
  crashPoint: 0,
  running: false,
  bets: {}
};

/* START GAME LOOP */
function startGame() {

game = {
multiplier: 1.0,
crashPoint: (Math.random() * 8 + 1.5).toFixed(2),
running: true,
bets: {}
};

console.log("Crash at:", game.crashPoint);

/* MULTIPLIER LOOP */
const interval = setInterval(() => {

game.multiplier += 0.05;
game.multiplier = parseFloat(game.multiplier.toFixed(2));

io.emit("multiplier", game.multiplier);

/* CRASH */
if(game.multiplier >= game.crashPoint){
clearInterval(interval);
io.emit("crash", game.crashPoint);
game.running = false;

/* restart after 5s */
setTimeout(startGame, 5000);
}

},100);

}

/* SOCKET */
io.on("connection", (socket) => {

socket.emit("multiplier", game.multiplier);

socket.on("cashout", (data) => {

if(!game.running) return;

let payout = data.bet * game.multiplier;

socket.emit("cashout_success", payout);

});

});

startGame();

server.listen(3000, () => console.log("Aviator running"));
