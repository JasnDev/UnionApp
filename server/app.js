import Express from 'express'
import dotenv from 'dotenv'
import  regis  from './major/register.js'
import cors from 'cors'
import  login  from './major/entrar.js'
import GetAll from './major/get.js'
import Audio from './major/audiopost.js'
import getall from './major/getaudio.js'


let app = Express();
const port=process.env.PORT;

app.use(Express.json());
app.use(cors());
dotenv.config();





app.get('/', GetAll)
app.get('/aud',getall)
app.post('/registro',regis)
app.post('/login',login)
app.post('/auio', Audio)

app.listen(port, ()=>{
    console.log(`Servidor Rodando na Porta ${port}`)

})
