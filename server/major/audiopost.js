import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import createGridFSBucket from '../connection/connection2.js';

// Obter o diretório atual do arquivo
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware para enviar arquivos de áudio para o bucket do GridFS
const uploadAudio = async (req, res) => {
  try {
    // Cria o GridFSBucket a partir da conexão existente
    const bucket = createGridFSBucket();

    const { topic } = req.body;  // Aqui estamos pegando o tópico
    const audio = req.file;  // O arquivo vem de req.file (usando multer)

    if (!audio || !topic) {
      return res.status(400).json({ error: 'Arquivo e tópico são obrigatórios.' });
    }

    // Caminho completo do arquivo enviado na pasta uploads
    const audioPath = path.join(__dirname, '../uploads', audio.filename);  // Ajustado para apontar para o arquivo específico

    // Verificar se o arquivo realmente existe
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado.' });
    }

    // Determina o tipo do arquivo com base na extensão
    const extname = path.extname(audio.originalname).toLowerCase();
    const mimeType = extname === '.mp3' ? 'audio/mpeg' : 'audio/m4a'; // Adicione mais tipos conforme necessário

    console.log(`Tipo de conteúdo: ${mimeType}`);

    // Cria o stream de upload para o GridFS, incluindo o tópico como metadado
    const uploadStream = bucket.openUploadStream(audio.originalname, {
      contentType: mimeType,
      metadata: { topicos: [topic] }  // Aqui estamos colocando o tópico no metadata
    });

    // Cria o stream de leitura do arquivo
    const fileStream = fs.createReadStream(audioPath);

    // Pipe o arquivo para o GridFS
    fileStream.pipe(uploadStream)
      .on('finish', () => {
        console.log(`Arquivo ${audio.originalname} enviado com sucesso para o MongoDB`);

        // Opcional: Remover o arquivo local após o upload, se necessário
        fs.unlink(audioPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Erro ao remover o arquivo local:', unlinkErr);
          } else {
            console.log(`Arquivo local ${audio.originalname} removido com sucesso.`);
          }
        });

        res.status(200).json({ message: 'Áudio enviado com sucesso!' });
      })
      .on('error', (error) => {
        console.error(`Erro ao enviar o arquivo ${audio.originalname} para o MongoDB:`, error);
        res.status(500).json({ error: `Erro ao enviar o arquivo ${audio.originalname}` });
      });
  } catch (error) {
    console.error('Erro ao enviar arquivos para o MongoDB:', error);
    res.status(500).json({ error: 'Erro ao enviar arquivos para o MongoDB' });
  }
};

export default uploadAudio;
