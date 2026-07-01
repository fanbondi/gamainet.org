const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Upload = require('../models/Upload');
const { requireAuth } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/pjpeg',
  'application/octet-stream',
]);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext);
    cb(null, ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

function handleUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large (max 10MB).' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    }
    next();
  });
}

router.post('/', requireAuth, handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image received. Use JPG, PNG, WebP, or GIF (max 10MB).',
      });
    }
    const url = `/uploads/${req.file.filename}`;
    const doc = await Upload.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
    res.json({ success: true, url, id: doc._id, filename: req.file.filename });
  } catch (err) {
    console.error('POST /api/upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Upload failed.' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const images = await Upload.find({}).sort({ uploadedAt: -1 }).limit(100);
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list images.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Upload.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Image not found.' });
    const filePath = path.join(uploadDir, doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await doc.deleteOne();
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete image.' });
  }
});

module.exports = router;
