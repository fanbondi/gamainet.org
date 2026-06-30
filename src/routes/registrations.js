const express = require('express');
const ProgramEvent = require('../models/ProgramEvent');
const Registration = require('../models/Registration');
const { requireAuth } = require('../middleware/auth');
const { sendRegistrationConfirmation } = require('../utils/mail');

const router = express.Router();

Registration.createIndexes().catch(() => {});

// POST /api/registrations — public, register for an event
router.post('/', async (req, res) => {
  try {
    const { eventId, name, email, organisation, role, phone, notes } = req.body;
    if (!eventId || !name || !email) {
      return res
        .status(400)
        .json({ success: false, message: 'Event, name, and email are required.' });
    }

    const event = await ProgramEvent.findById(eventId).lean();
    if (!event || !event.published) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (!event.registrationOpen) {
      return res.status(403).json({ success: false, message: 'Registration is closed for this event.' });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).toLowerCase().trim();

    await Registration.create({
      event: event._id,
      eventType: event.type,
      eventTitle: event.title,
      name: trimmedName,
      email: trimmedEmail,
      organisation: organisation?.trim() || '',
      role: role?.trim() || '',
      phone: phone?.trim() || '',
      notes: notes?.trim() || '',
    });

    let emailSent = false;
    try {
      emailSent = await sendRegistrationConfirmation({
        to: trimmedEmail,
        name: trimmedName,
        event,
      });
    } catch (mailErr) {
      console.error('Registration email failed:', mailErr.message);
    }

    const message = emailSent
      ? "You're registered! We've emailed you the event details."
      : `You're registered!${event.meetingUrl ? ' Join here: ' + event.meetingUrl : ' We will be in touch with details.'}`;

    res.status(201).json({
      success: true,
      message,
      emailSent,
      meetingUrl: event.meetingUrl || '',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'This email is already registered for this event.' });
    }
    console.error('POST /api/registrations error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

// GET /api/registrations?eventId=... — admin
router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.event = req.query.eventId;
    const registrations = await Registration.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, registrations, count: registrations.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load registrations.' });
  }
});

module.exports = router;
