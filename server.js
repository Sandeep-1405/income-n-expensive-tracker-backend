const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const router = require('./routes/routes');


const app = express()
app.use(express.json())
app.use(cors({
    origin: "https://income-n-expensive-tracker.vercel.app"
}));
  
app.use(router)

app.listen(process.env.port , ()=>{
    console.log(`Workers-Management Backend Server Started on port ${process.env.port}`)
})

/*
{
    "name":"Sunitha",
    "date":"24/04/2024",
    "area":"kaluva",
    "amount":300,
    "owner":"Sandeep"
    }
*/

