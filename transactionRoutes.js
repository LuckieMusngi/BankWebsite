const express = require("express");
const router = express.Router();

const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

router.post("/create", async (req, res) => {
  try {
    await client.connect();

    const db = client.db("bankDB");
    const accounts = db.collection("accounts");
    const transactions = db.collection("transactions");

    const { 
      accountId, userId, type, amount, description 
    } = req.body;

    // basic validation
    if (!accountId || !userId || !type || !amount) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }

    // find account
    const account = await accounts.findOne({
      _id: new ObjectId(accountId)
    });

    if (!account) {
      return res.status(404).json({ 
        message: "Account not found" 
      });
    }

    // update balance
    let newBalance = account.balance;

    if (type === "deposit") {
      newBalance += amount;
    }

  let mappedType = type;

  // convert category-like input into banking logic
  if (type === "Food" || type === "Rent" || type === "Gas") {
      mappedType = "withdraw";
  }

    if (type === "withdraw") {
      if (account.balance < amount) {
        return res.status(400).json({ 
          message: "Insufficient funds" 
        });
      }
      newBalance -= amount;
    }

    // update account in DB
    await accounts.updateOne(
      { 
        _id: new ObjectId(accountId) 
      },
      { 
        $set: { balance: newBalance } 
      }
    );

    // create transaction object
    const transaction = {
      accountId: new ObjectId(accountId),
      userId: new ObjectId(userId),
      type,
      amount,
      description: description || "",
      timestamp: new Date()
    };

    // insert transaction
    const result = await transactions.insertOne(transaction);

    res.status(201).json({
      _id: result.insertedId,
      ...transaction
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    await client.close();
  }
});
