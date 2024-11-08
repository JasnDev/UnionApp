import registro from "../connection/connection1.js";
import bcrypt from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const login = async(req,res) =>{
    const verifyemail = await registro.findOne({email:req.body.email})
    const verifysenha = await req.body.senha;
    if(verifyemail){
        const password = await verifyemail.senha;
    
        if(verifysenha == password){
            
            const jwt = Jwt.sign({_id:verifyemail._id},process.env.segredo);
            res.status(200).send({message:"Authorization-token",jwt})
            
                
            
        }else{
            res.status(400).send('email ou senha incorreto')
        }
    }
    }
    
    
    

export default login