const { MongoClient } = require("mongodb");
const winston = require("winston");

const mongoUri = process.env.MONGO_URI;
const dbName = "MaiMaiBataan";

let db;

async function connectToDatabase() {
  if (db) return db;

  try {
    const client = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(dbName);
    winston.info("Connected to MongoDB");
    return db;
  } catch (err) {
    winston.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

module.exports = connectToDatabase;
