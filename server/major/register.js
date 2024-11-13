import registro from '../connection/connection3.js';

const regis = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verificando se já existe um usuário com o mesmo email
    const existingUser = await registro.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email já registrado');
    }

    // Criando um novo usuário com os dados fornecidos
    const newUser = new registro({nome, email, senha});
    await newUser.save();  // Salvando o novo usuário no banco de dados

    res.status(201).send('Usuário registrado com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(400).send('Erro ao registrar usuário');
  }
};

export default regis;