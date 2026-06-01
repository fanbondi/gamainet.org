const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

Member.createIndexes().catch(() => {});

router.post('/', async (req, res) => {
  try {
    const { name, email, organisation, role, interests } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    await Member.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      organisation: organisation?.trim() || '',
      role: role?.trim() || '',
      interests: interests?.trim() || '',
    });

    res.status(201).json({ success: true, message: 'Welcome to AI-GAMNET! You are now registered.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'That email address is already registered.' });
    }
    console.error('POST /api/members error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

module.exports = router;
