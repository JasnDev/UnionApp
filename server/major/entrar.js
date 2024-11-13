import registro from '../connection/connection3.js';
import Jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const login = async (req, res) => {
  try {
    const verifyEmail = await registro.findOne({ email: req.body.email });
    if (verifyEmail) {
      const passwordMatch = req.body.senha === verifyEmail.senha; // Para produção, use bcrypt.compare()
      if (passwordMatch) {
        const token = Jwt.sign({ _id: verifyEmail._id }, process.env.segredo);
        return res.status(200).send({ message: 'Authorization-token', token });
      }
      return res.status(400).send('Email ou senha incorreta');
    }
    return res.status(400).send('Usuário não encontrado');
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('Erro interno');
  }
};

export default login;
