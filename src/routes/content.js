const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { requireAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const docs = await Content.find({});
    const map = {};
    docs.forEach((doc) => {
      map[doc.key] = doc.value;
    });
    res.json({ success: true, content: map });
  } catch (err) {
    console.error('GET /api/content error:', err);
    res.status(500).json({ success: false, message: 'Failed to load content.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid content payload.' });
    }

    const ops = Object.entries(content).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value: String(value), updatedAt: new Date() } },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await Content.bulkWrite(ops);
    }

    res.json({ success: true, message: `Saved ${ops.length} content items.` });
  } catch (err) {
    console.error('POST /api/content error:', err);
    res.status(500).json({ success: false, message: 'Failed to save content.' });
  }
});

module.exports = router;
