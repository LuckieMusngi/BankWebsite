const { MongoClient, ObjectId } = require("mongodb");

// connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// function to add a transaction
async function addTransaction(userId, type, amount, description) {
  try {
    await client.connect();

    const db = client.db("bankDB");
    const transactions = db.collection("transactions");
    const accounts = db.collection("accounts");

    // simple checks
    if (!userId || !type || !amount) {
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

    // find account automatically using userId
    const account = await accounts.findOne({
      userId: new ObjectId(userId)
    });

    if (!account) {
      console.log("Account not found for this user");
      return;
    }

    // create transaction object
    const transaction = {
      accountId: account._id, // pulled automatically
      userId: new ObjectId(userId),
      type: type,
      amount: amount,
      description: description || "",
      timestamp: new Date()
    };

    // insert into database
    const result = await transactions.insertOne(transaction);

    console.log("Transaction added:", result.insertedId);
  } catch (err) {
    console.log("Error:", err);
  } finally {
    await client.close();
  }
}

module.exports = { addTransaction };
