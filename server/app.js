import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import regis from './major/register.js';
import login from './major/entrar.js';
import GetAll from './major/get.js';
import getAllAudios from './major/getaudio.js';
import getAudio from './major/getaudiobyname.js';
import Audio from './major/audiopost.js';
import upload from './multerConfig.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.get('/', GetAll);
app.get('/audios',getAllAudios)
app.get('/audio/:filename',getAudio)
app.post('/registro', regis);
app.post('/login', login);
app.post('/upload', upload.single('audio'), Audio);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
