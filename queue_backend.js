const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const mongoUri = "mongodb+srv://python137124947:tBBm1jz8NDsTpAl1@maimaibataan.duve8cv.mongodb.net/?retryWrites=true&w=majority&appName=MaiMaiBataan";
const dbName = "MaiMaiBataan";
const collectionName = "gameHistory";

let db, gameHistoryCollection;

// Connect to MongoDB
MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    gameHistoryCollection = db.collection(collectionName);
    console.log("Connected to MongoDB");

    // Load game history from MongoDB on server start
    return gameHistoryCollection.find().toArray();
  })
  .then(history => {
    gameHistory = history.map(entry => ({
      players: entry.players,
      timestamp: entry.timestamp
    }));
  })
  .catch(err => console.error("Error connecting to MongoDB:", err));

let queue = [];
let gameHistory = [];
let currentlyPlaying = [];
let adminAuthenticated = false;
const adminPassword = "Nachi";

const historyFilePath = path.join(__dirname, "game_history.txt");

// Ensure the game history file exists
if (!fs.existsSync(historyFilePath)) {
  fs.writeFileSync(historyFilePath, "", "utf8");
}

// Load game history from file on server start
if (fs.existsSync(historyFilePath)) {
  const fileData = fs.readFileSync(historyFilePath, "utf8");
  gameHistory = fileData
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(line => {
      const match = line.match(/Game: (.+) - Started at (.+)/);
      if (match) {
        return { players: match[1].split(" vs "), timestamp: match[2] };
      }
      return null;
    })
    .filter(entry => entry !== null);
}

// Helper function to save game history to a file
function saveGameHistoryToFile() {
  const historyData = gameHistory.map(entry => 
    `Game: ${entry.players.join(" vs ")} - Started at ${entry.timestamp}`
  ).join("\n");
  fs.writeFileSync(historyFilePath, historyData, "utf8");
}

// Helper function to save game history to MongoDB
async function saveGameHistoryToMongoDB(entry) {
  try {
    await gameHistoryCollection.insertOne(entry);
  } catch (err) {
    console.error("Error saving game history to MongoDB:", err);
  }
}

// Admin Login
io.on("connection", (socket) => {
  console.log("New client connected");
  io.emit("queueUpdate", queue);
  io.emit("playingUpdate", currentlyPlaying); // Send currently playing on connect

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
    queue.push({ name: playerName, paid: false });
    io.emit("queueUpdate", queue);
  });

  // Swap Players
  socket.on("swapPlayers", ({ pos1, pos2 }) => {
    if (pos1 >= 0 && pos2 >= 0 && pos1 < queue.length && pos2 < queue.length) {
      [queue[pos1], queue[pos2]] = [queue[pos2], queue[pos1]];
      io.emit("queueUpdate", queue);
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
  socket.on("nextPairPlaying", async (callback) => {
    if (queue.length >= 2) {
      const pair = queue.slice(0, 2); // Get top 2 players
      if (!pair[0].paid || !pair[1].paid) {
        const unpaidPlayer = !pair[0].paid ? pair[0].name : pair[1].name;
        callback({ error: `${unpaidPlayer} is not yet paid. Please pay first before playing.` });
        return;
      }

      queue.splice(0, 2); // Remove top 2 players from the queue

      // Add to game history
      const timestamp = new Date().toISOString();
      const entry = { players: [pair[0].name, pair[1].name], timestamp };
      gameHistory.push(entry);

      // Save history to MongoDB
      await saveGameHistoryToMongoDB(entry);

      // Replace current pair if already playing
      currentlyPlaying = pair;

      io.emit("queueUpdate", queue);
      io.emit("playingUpdate", currentlyPlaying);
      io.emit("gameHistoryUpdate", gameHistory); // Emit updated game history
      callback({ success: true });
    } else {
      callback({ error: "Not enough players in the queue." });
    }
  });

  // Request Game History
  socket.on("requestGameHistory", async () => {
    try {
      const history = await gameHistoryCollection.find().toArray();
      socket.emit("gameHistoryUpdate", history.map(entry => ({
        players: entry.players,
        timestamp: entry.timestamp
      })));
    } catch (err) {
      console.error("Error retrieving game history from MongoDB:", err);
      socket.emit("gameHistoryUpdate", []);
    }
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

// Serve game history file
app.get("/game-history", (req, res) => {
  if (fs.existsSync(historyFilePath)) {
    res.sendFile(historyFilePath);
  } else {
    res.status(404).send("Game history file not found.");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
