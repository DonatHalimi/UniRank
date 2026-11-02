import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { uploadDirectory } from '../config/storage.js';

const allowed = new Map([
  ['application/pdf', '.pdf'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx'],
  ['image/png', '.png'], ['image/jpeg', '.jpg'],
]);
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),
  filename: (req, file, callback) => callback(null, `${randomUUID()}${allowed.get(file.mimetype)}`),
});
export const uploadMaterial = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowed.has(file.mimetype)) return callback(new Error('Unsupported file type. Upload PDF, DOCX, PPTX, PNG or JPG.'));
    if (path.extname(file.originalname).toLowerCase() !== allowed.get(file.mimetype)) return callback(new Error('The file extension does not match its MIME type.'));
    callback(null, true);
  },
});
