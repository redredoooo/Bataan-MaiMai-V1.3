const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const {
  addGameHistory,
  getGameHistory,
  clearGameHistory,
} = require("./game_history_service");

let queue = [];
let gameHistory = [];
let currentlyPlaying = [];
let adminAuthenticated = false;
const adminPassword = process.env.ADMIN_PASSWORD || "default-password";

// Admin Login
io.on("connection", (socket) => {
  console.log("New client connected");

  // Emit initial data to the client
  socket.emit("queueUpdate", queue); // Ensure queue is sent on connection
  socket.emit("playingUpdate", currentlyPlaying); // Ensure currently playing is sent on connection

  // Fetch game history from MongoDB and send to client
  getGameHistory().then((history) => {
    gameHistory = history;
    socket.emit("gameHistoryUpdate", gameHistory);
  }).catch(error => {
    console.error("Error fetching game history:", error);
  });

  socket.on("adminLogin", (password) => {
    if (password === adminPassword) {
      adminAuthenticated = true;
      socket.emit("loginSuccess");
    } else {
      socket.emit("loginFailed");
    }
  });

  // Add Player
  socket.on("addPlayer", (playerName) => {
    if (playerName) { // Ensure playerName is not empty
      queue.push({ name: playerName, paid: false });
      io.emit("queueUpdate", queue); // Emit updated queue
    } else {
      socket.emit("errorMessage", "Player name cannot be empty.");
    }
  });

  // Swap Players
  socket.on("swapPlayers", ({ pos1, pos2 }) => {
    if (pos1 >= 0 && pos2 >= 0 && pos1 < queue.length && pos2 < queue.length) {
      [queue[pos1], queue[pos2]] = [queue[pos2], queue[pos1]];
      io.emit("queueUpdate", queue);
    } else {
      socket.emit("errorMessage", "Invalid positions for swapping.");
    }
  });

  // Delete Top Pair
  socket.on("deleteTopPair", () => {
    if (queue.length >= 2) {
      queue.splice(0, 2);
    } else if (queue.length === 1) {
      queue.splice(0, 1);
    }
    io.emit("queueUpdate", queue);
  });

  // Delete Player by Position
  socket.on("deletePlayerByPosition", (pos) => {
    if (pos >= 0 && pos < queue.length) {
      queue.splice(pos, 1);
      io.emit("queueUpdate", queue);
    }
  });

  // Mark Player as Paid
  socket.on("markPlayerPaid", (pos) => {
    if (pos >= 0 && pos < queue.length) {
      queue[pos].paid = true;
      io.emit("queueUpdate", queue);
    }
  });

  // Display Current Pair
  socket.on("displayCurrentPair", () => {
    if (queue.length >= 2) {
      socket.emit("displayCurrentPair", [queue[0].name, queue[1].name]);
    } else {
      socket.emit("displayCurrentPair", []);
    }
  });

  // Next Pair Playing - Replace Current Pair
  socket.on("nextPairPlaying", async () => {
    if (queue.length >= 2) {
      const pair = queue.splice(0, 2); // Get top 2 players
      const timestamp = new Date().toISOString();

      // Add to MongoDB game history
      await addGameHistory([pair[0].name, pair[1].name], timestamp);

      // Fetch updated game history from MongoDB
      gameHistory = await getGameHistory();

      // Replace current pair
      currentlyPlaying = pair;

      io.emit("queueUpdate", queue); // Emit updated queue
      io.emit("playingUpdate", currentlyPlaying); // Emit updated currently playing
      io.emit("gameHistoryUpdate", gameHistory); // Emit updated game history
    } else {
      socket.emit("errorMessage", "Not enough players in the queue.");
    }
  });

  socket.on("requestGameHistory", async () => {
    gameHistory = await getGameHistory();
    socket.emit("gameHistoryUpdate", gameHistory);
  });

  socket.on("clearGameHistory", async () => {
    const deletedCount = await clearGameHistory();
    gameHistory = [];
    io.emit("gameHistoryUpdate", gameHistory);
    console.log(`Cleared ${deletedCount} game history records.`);
  });

  // Clear Currently Playing
  socket.on("deleteCurrentlyPlaying", () => {
    currentlyPlaying = [];
    io.emit("playingUpdate", currentlyPlaying);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
