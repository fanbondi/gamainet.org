const express = require('express');
const slugify = require('slugify');
const BlogPost = require('../models/BlogPost');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const isAdmin = !!(req.session && req.session.isAdmin);
    const filter = isAdmin ? {} : { published: true };
    const posts = await BlogPost.find(filter).sort({ year: -1, publishedAt: -1 }).lean();
    res.json({ success: true, posts });
  } catch (err) {
    console.error('GET /api/blog error:', err);
    res.status(500).json({ success: false, message: 'Failed to load blog posts.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const isAdmin = !!(req.session && req.session.isAdmin);
    const filter = { slug: req.params.slug };
    if (!isAdmin) filter.published = true;
    const post = await BlogPost.findOne(filter).lean();
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load post.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt, content, published, year, publishedAt } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }
    const finalSlug =
      slug ||
      slugify(title, { lower: true, strict: true, trim: true });
    const date = publishedAt ? new Date(publishedAt) : new Date();

    const post = await BlogPost.create({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt?.trim() || '',
      content,
      published: !!published,
      year: year || date.getFullYear(),
      publishedAt: date,
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A post with that slug already exists.' });
    }
    console.error('POST /api/blog error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update post.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await BlogPost.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
});

module.exports = router;
