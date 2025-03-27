const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  topic: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [questionSchema],
  timeLimit: { type: Number }, // in minutes
  passingScore: { type: Number, default: 70 },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);