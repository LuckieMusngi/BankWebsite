const { MongoClient, ObjectId } = require("mongodb");

// connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// function to add a transaction
async function addTransaction(accountId, userId, type, amount, description) {
  try {
    await client.connect();

    const db = client.db("bankDB");
    const collection = db.collection("transactions");

    // simple checks
    if (!accountId || !userId || !type || !amount) {
      console.log("Missing required fields");
      return;
    }

    if (type !== "deposit" && type !== "withdraw" && type !== "transfer") {
      console.log("Invalid type");
      return;
    }

    if (amount < 0) {
      console.log("Amount must be positive");
      return;
    }

    // create transaction object
    const transaction = {
      accountId: new ObjectId(accountId),
      userId: new ObjectId(userId),
      type: type,
      amount: amount,
      description: description || "",
      timestamp: new Date()
    };

    // insert into database
    const result = await collection.insertOne(transaction);

    console.log("Transaction added:", result.insertedId);
  } catch (err) {
    console.log("Error:", err);
  } finally {
    await client.close();
  }
}

module.exports = { addTransaction };
