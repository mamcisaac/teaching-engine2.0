import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import archiver from 'archiver';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

function getDbPath() {
  const url = process.env.DATABASE_URL || '';
  const match = url.match(/file:(.*)/);
  if (match) {
    return path.resolve(process.cwd(), match[1]);
  }
  return path.resolve(process.cwd(), 'prisma/dev.db');
}

function getUploadsPath() {
  return path.join(__dirname, '../uploads');
}

router.get('/', async (_req, res, next) => {
  try {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="backup.zip"');

    const archive = archiver('zip');
    archive.on('error', (err) => next(err));
    archive.pipe(res);

    const db = getDbPath();
    archive.file(db, { name: 'database.sqlite' });
    const uploads = getUploadsPath();
    if (fs.existsSync(uploads)) {
      archive.directory(uploads, 'uploads');
    }
    archive.finalize();
  } catch (err) {
    next(err);
  }
});

export default router;
