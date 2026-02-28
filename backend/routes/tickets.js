const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const auth = require('../middleware/auth');

/* ── GET /api/tickets  — list tickets for logged-in user ─────────────────── */
router.get('/', auth, async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const filter = role === 'ngo' || role === 'admin'
      ? {}                          // NGO/admin sees all tickets
      : { student: userId };        // students see only their own

    const tickets = await Ticket.find(filter)
      .populate('student', 'name email role')
      .populate('ngo', 'name email role')
      .sort({ lastMessageAt: -1 })
      .lean();

    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/* ── GET /api/tickets/:id  — single ticket detail ────────────────────────── */
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('student', 'name email role')
      .populate('ngo', 'name email role')
      .lean();

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Access check: student can only see their own ticket
    const uid = String(req.user._id);
    if (
      req.user.role === 'student' &&
      String(ticket.student._id) !== uid
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

/* ── POST /api/tickets  — student creates a new support ticket ───────────── */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can create tickets' });
    }
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'subject and message are required' });
    }

    const ticket = await Ticket.create({
      student: req.user._id,
      subject,
      messages: [{
        sender: req.user._id,
        senderName: req.user.name,
        senderRole: req.user.role,
        message,
      }],
    });

    const populated = await ticket.populate('student', 'name email role');
    res.status(201).json({ ticket: populated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/* ── POST /api/tickets/:id/messages  — send a message ───────────────────── */
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Access check
    const uid = String(req.user._id);
    const isStudent = req.user.role === 'student';
    if (isStudent && String(ticket.student) !== uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If NGO is replying for the first time, assign them
    if (!isStudent && !ticket.ngo) {
      ticket.ngo = req.user._id;
      if (ticket.status === 'open') ticket.status = 'in_progress';
    }

    const newMsg = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
    };
    ticket.messages.push(newMsg);
    ticket.lastMessageAt = new Date();
    await ticket.save();

    const savedMsg = ticket.messages[ticket.messages.length - 1];
    res.json({ message: savedMsg, ticket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/* ── PATCH /api/tickets/:id/status  — update ticket status ──────────────── */
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only NGO / admin can update status' });
    }
    const { status } = req.body;
    const allowed = ['open', 'in_progress', 'resolved', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'resolved' ? { resolvedAt: new Date() } : {}) },
      { new: true }
    )
      .populate('student', 'name email role')
      .populate('ngo', 'name email role');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

/* ── Typing Indicator (in-memory, no DB) ─────────────────────────────────
 * Key: `${ticketId}:${userId}`  Value: { name, role, expiresAt }
 * Entries automatically expire — we just filter on read.
 * ──────────────────────────────────────────────────────────────────────── */
const typingStore = new Map(); // key → { name, role, expiresAt }
const TYPING_TTL = 3500; // ms — how long a "typing" signal lives

/* POST /api/tickets/:id/typing  — caller is typing */
router.post('/:id/typing', auth, (req, res) => {
  const key = `${req.params.id}:${req.user._id}`;
  typingStore.set(key, {
    userId: String(req.user._id),
    name: req.user.name,
    role: req.user.role,
    expiresAt: Date.now() + TYPING_TTL,
  });
  res.json({ ok: true });
});

/* DELETE /api/tickets/:id/typing  — caller stopped typing */
router.delete('/:id/typing', auth, (req, res) => {
  const key = `${req.params.id}:${req.user._id}`;
  typingStore.delete(key);
  res.json({ ok: true });
});

/* GET /api/tickets/:id/typing  — who else is typing in this ticket? */
router.get('/:id/typing', auth, (req, res) => {
  const now = Date.now();
  const myId = String(req.user._id);
  const prefix = `${req.params.id}:`;
  const typers = [];

  for (const [key, val] of typingStore.entries()) {
    if (!key.startsWith(prefix)) continue;
    if (val.expiresAt < now) { typingStore.delete(key); continue; } // pruning
    if (val.userId === myId) continue;                               // hide self
    typers.push({ userId: val.userId, name: val.name, role: val.role });
  }

  res.json({ typers });
});

module.exports = router;

