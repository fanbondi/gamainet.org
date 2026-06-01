const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;

  if (!adminPassword) {
    return res.status(500).json({ success: false, message: 'ADMIN_PASSWORD is not configured.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password required.' });
  }
  if (password === adminPassword) {
    req.session.isAdmin = true;
    return res.json({ success: true, message: 'Logged in successfully.' });
  }
  return res.status(401).json({ success: false, message: 'Incorrect password.' });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Logged out.' });
  });
});

router.get('/status', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

module.exports = router;
