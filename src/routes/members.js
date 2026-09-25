const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { sendMembershipConfirmation } = require('../utils/mail');

Member.createIndexes().catch(() => {});

router.post('/', async (req, res) => {
  try {
    const { name, email, organisation, role, interests } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).toLowerCase().trim();

    await Member.create({
      name: trimmedName,
      email: trimmedEmail,
      organisation: organisation?.trim() || '',
      role: role?.trim() || '',
      interests: interests?.trim() || '',
    });

    let emailSent = false;
    try {
      emailSent = await sendMembershipConfirmation({ to: trimmedEmail, name: trimmedName });
    } catch (mailErr) {
      console.error('Membership email failed:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Welcome to AI-GAMNET! Your registration is confirmed by email.'
        : 'Welcome to AI-GAMNET! You are now registered.',
      emailSent,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'That email address is already registered.' });
    }
    console.error('POST /api/members error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

module.exports = router;
