// gridFsBucket.js
import { GridFSBucket } from 'mongodb';
import  mongoose from './connection1.js'; // Importe a conexão existente

function createGridFSBucket() {
    const db = mongoose.connection.db; // Obtém a instância do banco de dados conectada
    const bucket = new GridFSBucket(db, {
        bucketName: 'myBucket' // Nome do bucket, pode ser alterado conforme necessário
    });

    console.log('GridFSBucket configurado com sucesso');
    return bucket;
}

export default createGridFSBucket;
