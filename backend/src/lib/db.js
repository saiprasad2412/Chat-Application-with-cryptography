import mongoose from "mongoose";

export async function connectDB(){
    try {
        const mongoUri = process.env.MONGO_URI;
        if(!mongoUri){
            throw new Error("Invalid MONGO_URI !!")
        }

        const conn = await mongoose.connect(mongoUri);
        console.log("DB Connected !!", conn.connection.host);
        
        
    } catch (error) {
        console.log("MongoDb connection error:", error.message);
        process.exit(1);  //1 -> fail , 0--> success
        
    }
}