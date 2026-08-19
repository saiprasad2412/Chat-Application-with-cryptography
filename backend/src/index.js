import express from "express"
import "dotenv/config"
import { connectDB } from "./lib/db.js";
import {clerkMiddleware} from '@clerk/express';
import cors from "cors";

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

//middlewares
app.use(express.json());
app.use(cors({origin:CLIENT_URL, credentials:true})); //to enable diff port data access
app.use(clerkMiddleware());

app.get("/h",(req, res)=>{
    res.status(200).json({
        ok:true
    })
})

app.listen(PORT,()=>{
    connectDB();
    
})