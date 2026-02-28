const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

/* ── Middleware ─────────────────────────────────── */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

/* ── Routes ─────────────────────────────────────── */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/ngo', require('./routes/ngo'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/signs', require('./routes/signs'));   // Phase 2: sign language vocab
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/transcript-requests', require('./routes/transcriptRequests'));

/* ── Health check ───────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ── 404 handler ─────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ── Centralized error handler ───────────────────── */
app.use(require('./middleware/errorHandler'));

/* ── MongoDB + Start ─────────────────────────────── */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
