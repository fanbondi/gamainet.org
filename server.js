const fs = require('fs');
const dotenv = require('dotenv');
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aigamnet';
const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD) {
  app.set('trust proxy', 1);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.ADMIN_SECRET || 'aigamnet-fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PROD,
    },
  })
);

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/content', require('./src/routes/content'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/members', require('./src/routes/members'));
app.use('/api/blog', require('./src/routes/blog'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/registrations', require('./src/routes/registrations'));

const Contact = require('./src/models/Contact');
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }
    await Contact.create({ name, email, message, subject: subject || '' });
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

app.get('/e/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'event.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found.' });
  }

  let filePath = req.path;
  if (filePath === '/') filePath = '/index.html';
  else if (!path.extname(filePath)) filePath += '.html';

  const absPath = path.join(__dirname, 'public', filePath);
  if (fs.existsSync(absPath)) {
    return res.sendFile(absPath);
  }
  return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const mongoOptions = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
};

async function start() {
  try {
    await mongoose.connect(MONGO_URI, mongoOptions);
    const safeUri = MONGO_URI.replace(/\/\/[^@]+@/, '//***@');
    console.log('MongoDB connected:', safeUri);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    if (IS_PROD) process.exit(1);
    console.warn('Starting without DB — static pages work; API/CMS need MongoDB.');
  }

  const server = app.listen(PORT, () => {
    console.log(`AI-GAMNET running at http://localhost:${PORT}`);
    console.log('Admin: gear icon → ADMIN_PASSWORD from .env.local');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process: lsof -ti :${PORT} | xargs kill -9`);
      process.exit(1);
    }
    throw err;
  });
}

start();
