const express = require('express');
const ProgramEvent = require('../models/ProgramEvent');
const EventDiscussionPost = require('../models/EventDiscussionPost');

const router = express.Router();

EventDiscussionPost.createIndexes().catch(() => {});

function cleanName(value) {
  const raw = String(value || '').trim();
  return raw ? raw.slice(0, 60) : 'Anonymous';
}

function cleanBody(value) {
  return String(value || '').trim().replace(/\r\n/g, '\n');
}

async function loadDiscussionEvent(eventId) {
  const event = await ProgramEvent.findById(eventId).lean();
  if (!event || !event.published) return null;
  if (event.type !== 'webinar') return 'not-webinar';
  return event;
}

router.get('/events/:eventId', async (req, res) => {
  try {
    const event = await loadDiscussionEvent(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (event === 'not-webinar') {
      return res.status(400).json({ success: false, message: 'Discussion is available for webinars only.' });
    }

    const [threads, replies] = await Promise.all([
      EventDiscussionPost.find({ event: event._id, parent: null }).sort({ createdAt: -1 }).lean(),
      EventDiscussionPost.find({ event: event._id, parent: { $ne: null } }).sort({ createdAt: 1 }).lean(),
    ]);

    const replyMap = new Map();
    for (const reply of replies) {
      const key = String(reply.parent);
      if (!replyMap.has(key)) replyMap.set(key, []);
      replyMap.get(key).push(reply);
    }

    res.json({
      success: true,
      threads: threads.map((thread) => ({
        ...thread,
        replies: replyMap.get(String(thread._id)) || [],
      })),
    });
  } catch (err) {
    console.error('GET /api/discussions/events/:eventId error:', err);
    res.status(500).json({ success: false, message: 'Failed to load discussion.' });
  }
});

router.post('/events/:eventId', async (req, res) => {
  try {
    const event = await loadDiscussionEvent(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (event === 'not-webinar') {
      return res.status(400).json({ success: false, message: 'Discussion is available for webinars only.' });
    }

    const body = cleanBody(req.body.body);
    if (body.length < 3) {
      return res.status(400).json({ success: false, message: 'Please enter at least 3 characters.' });
    }

    const post = await EventDiscussionPost.create({
      event: event._id,
      eventType: 'webinar',
      authorName: cleanName(req.body.authorName),
      body,
      parent: null,
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error('POST /api/discussions/events/:eventId error:', err);
    res.status(500).json({ success: false, message: 'Could not post your question.' });
  }
});

router.post('/events/:eventId/:postId/replies', async (req, res) => {
  try {
    const event = await loadDiscussionEvent(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (event === 'not-webinar') {
      return res.status(400).json({ success: false, message: 'Discussion is available for webinars only.' });
    }

    const parent = await EventDiscussionPost.findOne({
      _id: req.params.postId,
      event: event._id,
      parent: null,
    }).lean();
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const body = cleanBody(req.body.body);
    if (body.length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter at least 2 characters.' });
    }

    const reply = await EventDiscussionPost.create({
      event: event._id,
      eventType: 'webinar',
      authorName: cleanName(req.body.authorName),
      body,
      parent: parent._id,
    });

    res.status(201).json({ success: true, reply });
  } catch (err) {
    console.error('POST /api/discussions/events/:eventId/:postId/replies error:', err);
    res.status(500).json({ success: false, message: 'Could not post your reply.' });
  }
});

module.exports = router;
