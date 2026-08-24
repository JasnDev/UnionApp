import createGridFSBucket from "../connection/connection2.js";

const getAllAudios = async (req, res) => {
  try {
    const bucket = createGridFSBucket();
    const apiUrl = (process.env.API_URL || `http://localhost:${process.env.PORT || 3030}`).replace(/\/$/, '');
    const { topico } = req.query;  // Recebe o tópico da query string
    //teste
    let query = {};
    if (topico) {
      try {
        const topicArray = JSON.parse(topico); 
        query = { 'metadata.topicos': { $in: topicArray } };
      } catch (error) {
        query = { 'metadata.topicos': { $in: [topico] } };
      }
    }

    const cursor = bucket.find(query);
    const audios = [];

    // Processa os arquivos encontrados
    await cursor.forEach((file) => {
      const fileSizeInMB = (file.length / (1024 * 1024)).toFixed(2); // Tamanho em MB
      const audioUrl = `${apiUrl}/audio/${encodeURIComponent(file.filename)}`;

      audios.push({
        filename: file.filename,
        length: file.length,
        sizeMB: fileSizeInMB,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
        url: audioUrl, // URL do áudio
      });
    });

    // Caso não tenha áudios filtrados, retorna todos
    if (audios.length === 0) {
      const cursorAll = bucket.find({});
      const allAudios = [];
      await cursorAll.forEach((file) => {
        const fileSizeInMB = (file.length / (1024 * 1024)).toFixed(2);
        const audioUrl = `${apiUrl}/audio/${encodeURIComponent(file.filename)}`;
        
        allAudios.push({
          filename: file.filename,
          length: file.length,
          sizeMB: fileSizeInMB,
          uploadDate: file.uploadDate,
          contentType: file.contentType,
          url: audioUrl, // URL do áudio
        });
      });

      // Se não encontrar áudios
      if (allAudios.length === 0) {
        return res.status(404).json({ error: 'Nenhum áudio encontrado' });
      }
      return res.status(200).json(allAudios); // Retorna todos os áudios
    }

    // Retorna os áudios filtrados
    return res.status(200).json(audios);
  } catch (error) {
    console.error('Erro ao recuperar arquivos do MongoDB:', error.message);
    return res.status(500).json({ error: 'Erro ao recuperar arquivos do MongoDB', details: error.message });
  }
};

export default getAllAudios;
