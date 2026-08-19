import express from "express"
import "dotenv/config"
import { connectDB } from "./lib/db.js";
import {clerkMiddleware} from '@clerk/express';
import cors from "cors";
import fs from "fs";
import path from "path";
import { log } from "console";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const publicDir= path.join(process.cwd(),"public"); //cwd--> current working directory

//middlewares
app.use(express.json());
app.use(cors({origin:CLIENT_URL, credentials:true})); //to enable diff port data access
app.use(clerkMiddleware());

app.get("/h",(req, res)=>{
    res.status(200).json({
        ok:true
    })
})
//to check if public dir exists, serve the static files
//this is for production build
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));
    app.get("/{*any}",(req,res, next)=>{
        res.sendFile(path.join(publicDir,"index.html"),(err)=>next(err));
    })
}

app.listen(PORT,()=>{
    connectDB();
    console.log(`server is up on port ${PORT}`);

    //for cron to intigrate with our app 
    if(process.env.NODE_ENV ==="production"){
        job.start();
    }
    
    
})