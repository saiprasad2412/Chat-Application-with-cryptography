import express from "express"
import "dotenv/config"
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT;

app.get("/h",(req, res)=>{
    res.status(200).json({
        ok:true
    })
})

app.listen(PORT,()=>{
    connectDB();
    
})