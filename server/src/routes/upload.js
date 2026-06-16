import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, '../../uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

const router = express.Router();

// Upload file
router.post('/file', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const id = uuidv4();
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Save to database
    db.prepare(`
      INSERT INTO files (id, user_id, name, type, size, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.userId, req.file.originalname, req.file.mimetype, req.file.size, fileUrl);
    
    res.status(201).json({
      data: {
        id,
        file_url: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get user files
router.get('/files', authMiddleware, (req, res) => {
  try {
    const files = db.prepare('SELECT * FROM files WHERE user_id = ? ORDER BY created_date DESC')
      .all(req.userId);
    
    res.json({ data: files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

// Delete file
router.delete('/file/:id', authMiddleware, (req, res) => {
  try {
    const file = db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    db.prepare('DELETE FROM files WHERE id = ?').run(req.params.id);
    
    // Note: Actual file deletion would need fs.unlink
    
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
