import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const address = process.env.ip;

mongoose.connect(address)
  .then(() => console.log('Conectado ao MongoDB com sucesso'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Exporte apenas a instância do `mongoose`
export default mongoose;
