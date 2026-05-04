const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

const transactionRoutes = require("./routes/transactionRoutes");

app.use("/transactions", transactionRoutes);

mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => 
    console.log("MongoDB connected")
)
.catch(err => 
    console.log(err)
);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
