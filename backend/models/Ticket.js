const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: { type: String, required: true },
  senderRole: {
    type: String,
    enum: ['student', 'ngo', 'admin'],
    required: true,
  },
  message: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

const ticketSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subject: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

ticketSchema.index({ student: 1, status: 1 });
ticketSchema.index({ ngo: 1, status: 1 });
ticketSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
