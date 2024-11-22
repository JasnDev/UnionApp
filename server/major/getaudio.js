import createGridFSBucket from '../connection/connection2.js';

const getAllAudios = async (req, res) => {
  try {
    const bucket = createGridFSBucket();

    // Buscar todos os arquivos no bucket
    const cursor = bucket.find({});

    // Crie um array para armazenar as informações dos arquivos
    const audios = [];

    // Itera sobre todos os arquivos encontrados e armazena as informações necessárias
    await cursor.forEach((file) => {
      audios.push({
        filename: file.filename,
        length: file.length,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
        url: `http://10.145.45.26:3030/audio/${file.filename}`  // Incluindo a URL completa
      });
    });

    // Se não encontrar áudios, retorne um erro
    if (audios.length === 0) {
      return res.status(404).json({ error: 'Nenhum áudio encontrado' });
    }

    // Retorne todos os áudios encontrados
    return res.status(200).json(audios);

  } catch (error) {
    console.error('Erro ao recuperar arquivos do MongoDB:', error);
    return res.status(500).json({ error: 'Erro ao recuperar arquivos do MongoDB' });
  }
};

export default getAllAudios;
