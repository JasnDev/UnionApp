import mongoose from 'mongoose';

// Define o esquema de um usuário
const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Impede duplicidade de emails
    trim: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: true,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
});

// Cria o modelo de Usuário
const registro = mongoose.model('User', userSchema);

export default registro;
