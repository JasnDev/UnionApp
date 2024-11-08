import audio from "../connection/connection2.js";
import dotenv from 'dotenv'

dotenv.config()

const Audio = async (req,res) => {
    const uri = req.body.uri
    
    try{
        const novo = await new audio({uri:uri})
        await novo.save()
        console.log('SALVO')

    }catch(error){
        console.log(error)
    }
}

export default Audio