const mongoose = require('mongoose');

const qaHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: String,
  answer: String,
  sources: [String],
  confidence: String,
  latencyMs: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QAHistory', qaHistorySchema);