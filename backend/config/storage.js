import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
export const uploadDirectory = path.resolve(here, '..', process.env.UPLOAD_DIR || 'uploads');

export async function deleteFile(fileUrl) {
  if (!fileUrl?.startsWith('/uploads/')) return;
  const target = path.resolve(uploadDirectory, path.basename(fileUrl));
  if (!target.startsWith(`${uploadDirectory}${path.sep}`)) return;
  try { await fs.unlink(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
