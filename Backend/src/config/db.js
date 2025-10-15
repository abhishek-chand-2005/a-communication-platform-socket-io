import mongoose from "mongoose"
import dotenv from 'dotenv';
dotenv.config();

export default function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('mongoDB connected')
    })
    .catch((err)=>{
        console.log('MongoDB error',err)
    })
}