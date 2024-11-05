import express from 'express'
import dotenv from 'dotenv'
import  regis  from './major/register.js'
import cors from 'cors'
import  login  from './major/entrar.js'
import GetAll from './major/get.js'
let app = express()

dotenv.config()

const port=process.env.PORT

app.use(express.json())
app.use(cors())

app.get('/', GetAll)

app.post('/registro',regis)
app.post('/login',login)

app.listen(port, ()=>{
    console.log("Eu não quero ao mal")

})
