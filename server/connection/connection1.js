import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const adress = process.env.ip

mongoose.connect(adress)

const connect = mongoose.connection;

const registro = connect.model("registro", {
    nome:{type:String},
    email:{type:String},
    senha:{type:String}
})

export default registro