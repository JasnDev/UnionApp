import createGridFSBucket from '../connection/connection2.js';

const getAudio = async (req, res) => {
  try {
    const bucket = createGridFSBucket();

    // Obtém o nome do arquivo a partir dos parâmetros da requisição
    const filename = req.params.filename;

    // Verifica se o arquivo existe no bucket
    const cursor = bucket.find({ filename });

    const fileExists = await cursor.hasNext();
    if (!fileExists) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    // Cria um stream de leitura a partir do bucket
    const downloadStream = bucket.openDownloadStreamByName(filename);

    res.setHeader('Content-Type', 'audio/mpeg'); // Altere conforme o tipo de conteúdo esperado
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Erro ao recuperar o arquivo:', error);
      res.status(500).json({ error: 'Erro ao recuperar o arquivo' });
    });

    downloadStream.on('end', () => {
      console.log(`Arquivo ${filename} enviado com sucesso`);
    });
  } catch (error) {
    console.error('Erro ao recuperar arquivos do MongoDB:', error);
    res.status(500).json({ error: 'Erro ao recuperar arquivos do MongoDB' });
  }
};

export default getAudio;
