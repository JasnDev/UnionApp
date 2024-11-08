import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const adress = process.env.ip

mongoose.connect(adress)

const connect = mongoose.connection;

const audio = connect.model("audio", {
    recording:{type:String},
    uri:{type:String}
    
    
})

export default audio