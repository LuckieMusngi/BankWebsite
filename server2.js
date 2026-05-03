var express = require('express')
var app = express()
var path = require('path')
var { MongoClient, ObjectId } = require('mongodb') 

const uri = 'mongodb://localhost:27017/'
const client = new MongoClient(uri)

app.use(express.json()) 

client.connect()
.then(()=>{console.log('Connected to MongoDB')})
.catch((error)=>console.log('Connection failed'))

const db = client.db('Users')
var bankData = db.collection('Banking')

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'logIn.html'))
})

app.post('/login', async (req, res)=>{
    const {Username, Password} = req.body
    try{
        // Fix 4: Added 'await'
        const userData = await bankData.findOne({
            "users":{
                $elemMatch: {"Username": Username, "Password":Password}
            }
        })
        if(userData){
            res.status(200).send('Success')
        }
        else{
            res.status(401).send('Invalid User Info')
        }
    }
    catch(err){
        res.status(500).send('Server Error')
    }
})

app.get('/signup', (req, res)=>{
    res.sendFile(path.join(__dirname, 'signUp.html')) 
})

app.post('/signup', async (req, res)=>{
    const {Username, Password, Accounts} = req.body;
    try{
        const result = await bankData.updateOne(
            { _id: new ObjectId("69f2e6b83a2d9f35d6c6fabd") },
            { 
                $push: { 
                    users: { 
                        Username: Username, 
                        Password: Password, 
                        Accounts: Accounts 
                    } 
                } 
            }
        )
        if (result.modifiedCount === 1) {
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

app.get('/accounts',(req, res)=>{
    res.sendFile(path.join(__dirname, 'accounts.html'))
})

app.listen(8080, ()=>{console.log('Server running on http://localhost:8080')})
