var express = require('express')
var app = express()
var url = require('url')
var path = require('path')
var {MongoClient} = require('mongodb')

const uri = 'mongodb://localhost:27017/'
const client = new MongoClient(uri)

app.use(express.json)

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
        const userData = bankData.findOne({
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

app.get('/accounts',(req, res)=>{
    res.send(path.join(__dirname, 'accounts.html'))
})

app.listen(8080, ()=>{console.log('Server running.')})
