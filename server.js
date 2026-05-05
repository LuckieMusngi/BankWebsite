// Server handles/helps with everything, from backend to page rendering

//* setup
// vars
var express = require('express')
var app = express()
var path = require('path')
var { MongoClient } = require('mongodb') 
var fs = require('fs')

// MongoDB and express setup
const uri = 'mongodb://localhost:27017/'
const client = new MongoClient(uri)
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname))

client.connect()
.then(()=>{console.log('Connected to MongoDB')})
.catch((error)=>console.log('Connection failed'))

// data stored in db and collections
const db = client.db('Banking')

const usersCollection = db.collection('Users')
const accountsCollection = db.collection('Accounts')
const transactionsCollection = db.collection('Transactions')


//* handling

// handle default, send login page
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'logIn.html'))
})

// handle verify session - restore accounts page from localStorage username
// handle login, check if user exists and send accounts page file
app.post('/login', async (req, res)=>{
    const {Username, Password} = req.body
    try{
        const userData = await usersCollection.findOne({
            Username: Username,
            Password: Password
        })
        if(userData){
            res.sendFile(path.join(__dirname, 'accounts.html'))
        }
        else{
            res.status(401).send('Invalid User Info')
        }
    }
    catch(err){
        res.status(500).send('Server Error')
    }
})

// handle get accounts data, returns the accounts data (account number, type, balance)
app.post('/get-accounts', async (req, res)=>{
    const { Username } = req.body
    try{
        const userData = await usersCollection.findOne({ Username: Username })
        if(!userData){
            return res.status(401).send('Unauthorized')
        }
        const userAccounts = await accountsCollection.find({ Username: Username }).toArray()
        res.json({
            userName: userData.Name || Username,
            accountCount: userAccounts.length + ' account(s)',
            accounts: userAccounts
        })
    }
    catch(err){
        res.status(500).send('Server Error')
    }
})

// handle sign up page (literal just send the page)
app.get('/signup', (req, res)=>{
    res.sendFile(path.join(__dirname, 'signUp.html')) 
})

// handle sign up, check if username is taken and if not add to db
app.post('/signup', async (req, res)=>{
    const {Name, Username, Password} = req.body
    try{
        const existingUser = await usersCollection.findOne({ Username: Username });
        if(existingUser){return res.status(409).send("Username already taken. Please choose another.");}
        const result = await usersCollection.insertOne({
            Name: Name || Username,
            Username: Username,
            Password: Password
        })
        if (result.insertedId) {
            res.status(201).send("User registered successfully");
        } else {
            res.status(400).send("Failed to register user");
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
})

app.post('/delete-account', async (req, res)=>{
    const { Username, accountNumber } = req.body

    try{
        if(!Username || !accountNumber){
            return res.status(400).send('Missing account info')
        }

        await accountsCollection.deleteOne({
            Username: Username,
            'Account #': Number(accountNumber)
        })

        const userData = await usersCollection.findOne({ Username: Username })
        if(!userData){
            return res.status(404).send('User not found')
        }

        res.sendFile(path.join(__dirname, 'accounts.html'))
    }
    catch(err){
        return res.status(500).send('Server Error')
    }
})

// start server
app.listen(8080, ()=>{console.log('Server running on http://localhost:8080')})
