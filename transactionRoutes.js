const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const Account = require("../models/Account"); 

router.post("/create", async (req, res) => {
  try {
    const { 
      accountId, userId, type, amount, description 
    } = req.body;

    if (!accountId || !userId || !type || !amount) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({ 
        message: "Account not found" 
      });
    }

    if (type === "deposit") {
      account.balance += amount;
    }

    if (type === "withdraw") {
      if (account.balance < amount) {
        return res.status(400).json({ 
          message: "Insufficient funds" 
        });
      }
      account.balance -= amount;
    }

    await account.save();

    const transaction = new Transaction({
        accountId,
        userId,
        type,
        amount,
        description
    });

    await transaction.save();

    res.status(201).json(transaction);

  } catch (err) {
    res.status(500).json({ 
      message: err.message 
    });
  }
});

router.get("/account/:accountId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      accountId: req.params.accountId
    }).sort({ 
      timestamp: -1 
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ 
      message: err.message 
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.params.userId
    }).sort({ 
      timestamp: -1 
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ 
      message: err.message 
    });
  }
});

module.exports = router;
