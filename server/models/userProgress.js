const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  topic: { type: String, required: true },
  scores: [{
    attempt: { type: Number, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }],
  averageScore: { type: Number },
  highestScore: { type: Number },
  lowestScore: { type: Number },
  completionRate: { type: Number },
  lastAttempt: { type: Date },
  totalAttempts: { type: Number, default: 0 }
});

module.exports = mongoose.model('UserProgress', progressSchema);