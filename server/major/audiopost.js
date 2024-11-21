import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import createGridFSBucket from '../connection/connection2.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware para enviar arquivos de áudio para o bucket do GridFS
const uploadAudio = async (req, res) => {
  try {
    // Cria o GridFSBucket a partir da conexão existente
    const bucket = createGridFSBucket();

    // Pega os tópicos enviados pela requisição e garante que sejam um array
    let { topicos } = req.body; // 'topicos' pode ser enviado como string ou array

    if (!topicos) {
      return res.status(400).json({ error: 'Topicos são obrigatórios.' });
    }

    // Se 'topicos' for uma string, tentamos analisar como JSON
    if (typeof topicos === 'string') {
      try {
        // Tentamos converter a string para um array, caso seja uma string JSON
        topicos = JSON.parse(topicos);
      } catch (e) {
        return res.status(400).json({ error: 'O campo "topicos" deve ser um array ou uma string válida que represente um array.' });
      }
    }

    // Verifica se 'topicos' é realmente um array
    if (!Array.isArray(topicos)) {
      return res.status(400).json({ error: 'O campo "topicos" deve ser um array.' });
    }

    // Caminho da pasta 'uploads'
    const folderPath = path.join(__dirname, '../uploads');

    // Verifica se a pasta 'uploads' existe
    if (!fs.existsSync(folderPath)) {
      console.error('A pasta "uploads" não existe.');
      return res.status(400).json({ error: 'A pasta "uploads" não existe.' });
    }

    // Lê todos os arquivos na pasta 'uploads'
    const files = fs.readdirSync(folderPath);

    if (files.length === 0) {
      console.log('Não há arquivos para enviar.');
      return res.status(400).json({ error: 'Nenhum arquivo encontrado na pasta' });
    }

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // Verifica se o arquivo realmente existe
      if (fs.existsSync(filePath)) {
        console.log(`Enviando arquivo: ${file}`);

        const fileStream = fs.createReadStream(filePath);

        // Determina o tipo do arquivo com base na extensão
        const extname = path.extname(file).toLowerCase();
        const mimeType = extname === '.mp3' ? 'audio/mpeg' : 'audio/m4a'; // Adicione mais tipos conforme necessário

        console.log(`Tipo de conteúdo: ${mimeType}`);

        // Cria o stream de upload para o GridFS e inclui 'topicos' como metadado
        const uploadStream = bucket.openUploadStream(file, {
          contentType: mimeType,
          metadata: { topicos }, // Inclui os tópicos no metadado como array
        });

        // Envia o arquivo para o GridFS e lida com eventos
        fileStream.pipe(uploadStream)
          .on('finish', () => {
            console.log(`Arquivo ${file} enviado com sucesso para o MongoDB`);
            // Remove o arquivo local após o upload
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Erro ao remover o arquivo local:', unlinkErr);
              } else {
                console.log(`Arquivo local ${file} removido com sucesso.`);
              }
            });
          })
          .on('error', (error) => {
            console.error(`Erro ao enviar o arquivo ${file} para o MongoDB:`, error);
            res.status(500).json({ error: `Erro ao enviar o arquivo ${file}` });
          });
      } else {
        console.error(`Arquivo não encontrado: ${file}`);
      }
    }

    // Responde com sucesso após todos os arquivos serem enviados
    res.status(200).json({ message: 'Arquivos enviados com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar arquivos para o MongoDB:', error);
    res.status(500).json({ error: 'Erro ao enviar arquivos para o MongoDB' });
  }
};

export default uploadAudio;
