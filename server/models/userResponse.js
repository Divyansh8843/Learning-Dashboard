const mongoose = require('mongoose');

const userAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number } // in seconds
});

const userResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [userAnswerSchema],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  incorrectAnswers: { type: Number, required: true },
  completionTime: { type: Number }, // in seconds
  completedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'completed' }
});

module.exports = mongoose.model('UserResponse', userResponseSchema);