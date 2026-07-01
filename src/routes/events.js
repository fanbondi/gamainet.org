const express = require('express');
const slugify = require('slugify');
const ProgramEvent = require('../models/ProgramEvent');
const Registration = require('../models/Registration');
const { requireAuth } = require('../middleware/auth');
const {
  normalizeShortCode,
  suggestShortCode,
  ensureUniqueShortCode,
  eventLookupFilter,
} = require('../utils/event-codes');

const router = express.Router();

const TYPES = ['meetup', 'indabax', 'webinar'];

function isAdmin(req) {
  return !!(req.session && req.session.isAdmin);
}

// GET /api/events?type=indabax&featured=true&upcoming=true
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type && TYPES.includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    if (req.query.upcoming === 'true') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      filter.$or = [{ startDate: { $gte: now } }, { endDate: { $gte: now } }];
    }
    if (!isAdmin(req)) filter.published = true;

    const upcoming = req.query.upcoming === 'true';
    const events = await ProgramEvent.find(filter)
      .sort(upcoming ? { startDate: 1, year: 1, createdAt: -1 } : { startDate: -1, year: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, events });
  } catch (err) {
    console.error('GET /api/events error:', err);
    res.status(500).json({ success: false, message: 'Failed to load events.' });
  }
});

function buildPayload(body) {
  return {
    type: TYPES.includes(body.type) ? body.type : 'meetup',
    title: String(body.title || '').trim(),
    summary: body.summary?.trim() || '',
    description: body.description ?? null,
    theme: body.theme?.trim() || '',
    coverImage: body.coverImage?.trim() || '',
    location: body.location?.trim() || '',
    venue: body.venue?.trim() || '',
    startDate: body.startDate ? new Date(body.startDate) : undefined,
    endDate: body.endDate ? new Date(body.endDate) : undefined,
    timeInfo: body.timeInfo?.trim() || '',
    year: body.year ? Number(body.year) : undefined,
    speakers: Array.isArray(body.speakers) ? body.speakers : [],
    agenda: Array.isArray(body.agenda) ? body.agenda : [],
    registrationOpen: body.registrationOpen !== false,
    externalRegistrationUrl: body.externalRegistrationUrl?.trim() || '',
    meetingUrl: body.meetingUrl?.trim() || '',
    published: !!body.published,
    featured: !!body.featured,
    shortCode: body.shortCode?.trim() ? normalizeShortCode(body.shortCode) : undefined,
  };
}

async function resolveShortCode(body, excludeId = null) {
  const manual = body.shortCode?.trim();
  if (manual) return ensureUniqueShortCode(manual, excludeId);
  return ensureUniqueShortCode(
    suggestShortCode({
      title: body.title,
      type: body.type,
      startDate: body.startDate,
    }),
    excludeId
  );
}

// POST /api/events — create
router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    if (!payload.title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    const base =
      req.body.slug?.trim() ||
      slugify(payload.title, { lower: true, strict: true, trim: true });
    payload.slug = base;
    if (!payload.year && payload.startDate) {
      payload.year = payload.startDate.getFullYear();
    }
    payload.shortCode = await resolveShortCode(req.body);

    const event = await ProgramEvent.create(payload);
    res.status(201).json({ success: true, event });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An event with that slug or short link already exists.' });
    }
    console.error('POST /api/events error:', err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

// PUT /api/events/:id — update
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    if (req.body.slug?.trim()) {
      payload.slug = req.body.slug.trim();
    }
    if (req.body.shortCode !== undefined) {
      const manual = req.body.shortCode?.trim();
      if (manual) {
        payload.shortCode = await ensureUniqueShortCode(manual, req.params.id);
      } else {
        payload.shortCode = await resolveShortCode(req.body, req.params.id);
      }
    }
    const event = await ProgramEvent.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, event });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An event with that slug or short link already exists.' });
    }
    console.error('PUT /api/events/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const event = await ProgramEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    await Registration.deleteMany({ event: event._id });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/events/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

// GET /api/events/:id/registrations — admin list of registrations
router.get('/:id/registrations', requireAuth, async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, registrations, count: registrations.length });
  } catch (err) {
    console.error('GET registrations error:', err);
    res.status(500).json({ success: false, message: 'Failed to load registrations.' });
  }
});

// GET /api/events/:slug — single event by slug or short code
router.get('/:slug', async (req, res) => {
  try {
    const filter = eventLookupFilter(req.params.slug);
    if (!isAdmin(req)) filter.published = true;
    const event = await ProgramEvent.findOne(filter).lean();
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, event });
  } catch (err) {
    console.error('GET /api/events/:slug error:', err);
    res.status(500).json({ success: false, message: 'Failed to load event.' });
  }
});

module.exports = router;
