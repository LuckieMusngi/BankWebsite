var http = require('http')
var url = require('url')
var express = require('express')
var app = express()
var fs = require('fs')

http.createServer(function(req, res){
    res.writeHead(200, { 'Content-Type': 'text/html' });
    if (req.url.contains('login') && req.method === 'GET'){
        res.end(fs.readFileSync('logIn.html'))
    }
    else if (req.url.includes('login') && req.method === 'POST'){
        let body = ''
        req.on('data', chunk=>{
            body += chunk.toString();
        })
        req.on('end', ()=>{
            userData = JSON.parse(body)
        })
        const user = await db.collection('users').findOne({ 
            Username: userData.username, 
            Password: userData.password 
        });
        if(user){
            req.url = "http://localhost:8080/accounts"
        }
    }
    if(req.url.contains('signUp') && method === 'GET'){
        res.end(fs.readFileSync('signUp.html'))
    }
    else if(req.url.contains('signUp') && method === 'POST'){
        let body = ''
        req.on('data', chunk=>{
            body += chunk.toString();
        })
        req.on('end',()=>{
            const userData = JSON.parse(body)
        })
        await db.collection('users').insertOne({
            Username: newUser.Username,
            Password: newUser.Password,
            Accounts: newUser.Accounts
        });
    }
}).listen(8080)
