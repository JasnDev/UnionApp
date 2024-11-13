import multer from 'multer';
import path from 'path';

// Definindo o armazenamento para o multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');  // Pasta onde os arquivos serão temporariamente armazenados
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));  // Definindo um nome único para o arquivo
  }
});

// Criando o middleware de upload
const upload = multer({ storage: storage });

export default upload;
