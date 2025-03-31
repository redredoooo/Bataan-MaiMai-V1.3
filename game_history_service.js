const { MongoClient } = require("mongodb");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://Website:hGRwwSQoVoZpDfHe@maimaibataan.duve8cv.mongodb.net/?retryWrites=true&w=majority&appName=MaiMaiBataan";
const client = new MongoClient(uri);

const dbName = "BataanMaiMaiCommunity";
const collectionName = "Game History";

async function connectToDatabase() {
    try {
        if (!client.isConnected) {
            await client.connect();
        }
        return client.db(dbName).collection(collectionName);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

async function addGameHistory(players, timestamp) {
    try {
        const collection = await connectToDatabase();
        const result = await collection.insertOne({ players, timestamp });
        return result.insertedId;
    } catch (error) {
        console.error("Error adding game history:", error);
        throw error;
    }
}

async function getGameHistory() {
    try {
        const collection = await connectToDatabase();
        return await collection.find({}).sort({ timestamp: -1 }).toArray();
    } catch (error) {
        console.error("Error fetching game history:", error);
        throw error;
    }
}

async function clearGameHistory() {
    try {
        const collection = await connectToDatabase();
        const result = await collection.deleteMany({});
        return result.deletedCount;
    } catch (error) {
        console.error("Error clearing game history:", error);
        throw error;
    }
}

module.exports = {
    addGameHistory,
    getGameHistory,
    clearGameHistory,
};
