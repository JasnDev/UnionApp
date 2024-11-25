import createGridFSBucket from "../connection/connection2.js";

const getAllAudios = async (req, res) => {
  try {
    const bucket = createGridFSBucket();
    const { topico } = req.query;  // Recebe o tópico da query string

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

    await cursor.forEach((file) => {
      const fileSizeInMB = (file.length / (1024 * 1024)).toFixed(2);
      const audioUrl = `http://10.145.45.26:3030/audio/${file.filename}`;
      
      audios.push({
        filename: file.filename,
        length: file.length,
        sizeMB: fileSizeInMB,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
        url: `http://10.145.45.26:3030/audio/${file.filename}`  // Incluindo a URL completa
      });
    });

    if (audios.length === 0) {
      const cursorAll = bucket.find({});
      const allAudios = [];
      await cursorAll.forEach((file) => {
        const fileSizeInMB = (file.length / (1024 * 1024)).toFixed(2);
        const audioUrl = `http://10.145.45.26:3030/audio/${file.filename}`;
        
        allAudios.push({
          filename: file.filename,
          length: file.length,
          sizeMB: fileSizeInMB,
          uploadDate: file.uploadDate,
          contentType: file.contentType,
          url: audioUrl,
        });
      });

      if (allAudios.length === 0) {
        return res.status(404).json({ error: 'Nenhum áudio encontrado' });
      }
      return res.status(200).json(allAudios);
    }

    return res.status(200).json(audios);
  } catch (error) {
    console.error('Erro ao recuperar arquivos do MongoDB:', error.message);
    return res.status(500).json({ error: 'Erro ao recuperar arquivos do MongoDB', details: error.message });
  }
};
export default getAllAudios;
