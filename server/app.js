import express from 'express'
import dotenv from 'dotenv'
import  regis  from './major/register.js'
import cors from 'cors'
import  login  from './major/entrar.js'
import GetAll from './major/get.js'
import Audio from './major/audiopost.js'
import getall from './major/getaudio.js'


let app = express()

dotenv.config()

const port=process.env.PORT

app.use(express.json())
app.use(cors())

app.get('/', GetAll)
app.get('/aud',getall)

app.post('/registro',regis)
app.post('/login',login)
app.post('/auio', Audio)

app.listen(port, ()=>{
    console.log("Eu não quero ao mal")

})
