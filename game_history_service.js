const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://python137124947:ODC0hDoI6EslbPpa@maimaibataan.duve8cv.mongodb.net/?retryWrites=true&w=majority&appName=MaiMaiBataan";
const client = new MongoClient(uri);

const dbName = "BataanMaiMaiCommunity";
const collectionName = "Game History";

async function connectToDatabase() {
    if (!client.isConnected) {
        await client.connect();
    }
    return client.db(dbName).collection(collectionName);
}

async function addGameHistory(players, timestamp) {
    const collection = await connectToDatabase();
    const result = await collection.insertOne({ players, timestamp });
    return result.insertedId;
}

async function getGameHistory() {
    const collection = await connectToDatabase();
    return await collection.find({}).sort({ timestamp: -1 }).toArray();
}

async function clearGameHistory() {
    const collection = await connectToDatabase();
    const result = await collection.deleteMany({});
    return result.deletedCount;
}

module.exports = {
    addGameHistory,
    getGameHistory,
    clearGameHistory,
};
