import  registro  from "../connection/connection1.js";
import bcrypt from 'bcryptjs'

export default async function regis(req,res){
    const nome = req.body.nome
    const email = req.body.email
    const senha = bcrypt.hashSync(req.body.senha)
    const verifyemail=await registro.findOne({email:email})
    if(verifyemail){
        console.log("Deu erro email ja cadastrado!")
    }else{
    try {
        const postar = await new registro({nome:nome,  email:email,senha:senha})
        await postar.save() 
        res.send('deu certo!')
    } catch (error) {
        console.error('deu ruim', error)
        res.status(400).send('não deu certo')
    }
}
}

