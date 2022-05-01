const express = require('express')
const app = express()
const env = require('./Env')
const mongoose = require('mongoose')
const auth = require('./Route/Auth')
const quesiton = require('./Route/Questions')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')



mongoose.connect(env.mongoURL,{usenewurlparser:true, useunifiedtopology:true}).then(()=>{
    console.log("Mongo DB connected");
})
.catch(err=>{console.log("DB not connected",err);})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))
app.use(express.json())
app.use(auth)
app.use(quesiton)


app.listen('7077',()=>{
    console.log("Server Started at localhost:7077");
})