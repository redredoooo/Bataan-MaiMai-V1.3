require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const Joi = require("joi");
const winston = require("winston");
const connectToDatabase = require("./config/database");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

// Logger setup
winston.add(new winston.transports.Console());
winston.add(new winston.transports.File({ filename: "app.log" }));

// Environment variables
const adminPassword = process.env.ADMIN_PASSWORD;
const port = process.env.PORT || 3000;

let queue = [];
let gameHistory = [];
let currentlyPlaying = [];
let gameHistoryCollection;

// Input validation schemas
const playerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  paid: Joi.boolean().optional(),
});

const positionSchema = Joi.object({
  pos1: Joi.number().integer().min(0).required(),
  pos2: Joi.number().integer().min(0).required(),
});

// Connect to MongoDB and initialize the game history collection
(async () => {
  try {
    const db = await connectToDatabase();
    gameHistoryCollection = db.collection("gameHistory");
    gameHistory = await gameHistoryCollection.find().toArray();
    winston.info("Game history loaded from MongoDB");
  } catch (err) {
    winston.error("Error initializing database:", err);
  }
})();

// Helper function to save game history to MongoDB
async function saveGameHistory(entry) {
  try {
    await gameHistoryCollection.insertOne(entry);
    winston.info("Game history saved to MongoDB");
  } catch (err) {
    winston.error("Error saving game history to MongoDB:", err);
  }
}

// WebSocket logic
io.on("connection", (socket) => {
  winston.info("New client connected");

  socket.emit("queueUpdate", queue);
  socket.emit("playingUpdate", currentlyPlaying);

  socket.on("adminLogin", (password) => {
    if (password === adminPassword) {
      socket.emit("loginSuccess");
    } else {
      socket.emit("loginFailed");
    }
  });

  socket.on("addPlayer", (playerName) => {
    const { error } = playerSchema.validate({ name: playerName });
    if (error) {
      socket.emit("error", error.details[0].message);
      return;
    }

    queue.push({ name: playerName, paid: false });
    io.emit("queueUpdate", queue);
  });

  socket.on("swapPlayers", ({ pos1, pos2 }) => {
    const { error } = positionSchema.validate({ pos1, pos2 });
    if (error) {
      socket.emit("error", error.details[0].message);
      return;
    }

    if (pos1 < queue.length && pos2 < queue.length) {
      [queue[pos1], queue[pos2]] = [queue[pos2], queue[pos1]];
      io.emit("queueUpdate", queue);
    }
  });

  socket.on("deleteTopPair", () => {
    queue.splice(0, Math.min(2, queue.length));
    io.emit("queueUpdate", queue);
  });

  socket.on("deletePlayerByPosition", (pos) => {
    if (pos >= 0 && pos < queue.length) {
      queue.splice(pos, 1);
      io.emit("queueUpdate", queue);
    }
  });

  socket.on("markPlayerPaid", (pos) => {
    if (pos >= 0 && pos < queue.length) {
      queue[pos].paid = true;
      io.emit("queueUpdate", queue);
    }
  });

  socket.on("nextPairPlaying", async (callback) => {
    if (queue.length >= 2) {
      const pair = queue.slice(0, 2);
      if (pair.some(player => !player.paid)) {
        const unpaidPlayer = pair.find(player => !player.paid).name;
        callback({ error: `${unpaidPlayer} is not yet paid.` });
        return;
      }

      queue.splice(0, 2);
      const timestamp = new Date().toISOString();
      const entry = { players: [pair[0].name, pair[1].name], timestamp };
      gameHistory.push(entry);

      try {
        await saveGameHistory(entry);
      } catch (err) {
        winston.error("Error saving game history:", err);
      }

      currentlyPlaying = pair;
      io.emit("queueUpdate", queue);
      io.emit("playingUpdate", currentlyPlaying);
      io.emit("gameHistoryUpdate", gameHistory);
      callback({ success: true });
    } else {
      callback({ error: "Not enough players in the queue." });
    }
  });

  socket.on("requestGameHistory", async () => {
    try {
      const history = await gameHistoryCollection.find().toArray();
      socket.emit("gameHistoryUpdate", history);
    } catch (err) {
      winston.error("Error fetching game history:", err);
      socket.emit("error", "Failed to fetch game history.");
    }
  });

  socket.on("deleteCurrentlyPlaying", () => {
    currentlyPlaying = [];
    io.emit("playingUpdate", currentlyPlaying);
  });

  socket.on("disconnect", () => {
    winston.info("Client disconnected");
  });
});

// Start the server
server.listen(port, () => {
  winston.info(`Server running on port ${port}`);
});
