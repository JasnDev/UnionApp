import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const uploadDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads');
const temporaryDirectory = process.env.VERCEL ? '/tmp' : uploadDirectory;
fs.mkdirSync(temporaryDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, temporaryDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export default upload;
