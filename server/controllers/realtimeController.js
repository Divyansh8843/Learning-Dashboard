const UserResponse = require('../models/userResponse');
const Quiz = require('../models/Quiz');
const UserProgress = require('../models/userProgress');
const { updateLiveQuizStats } = require('../services/realtimeService');

// Track quiz attempt in real-time
exports.trackQuizAttempt = async (req, res) => {
  try {
    const { quizId, userId } = req.params;
    const { answers, score, completionTime } = req.body;
    
    // Save response
    const response = new UserResponse({
      userId,
      quizId,
      answers,
      score,
      totalQuestions: answers.length,
      correctAnswers: answers.filter(a => a.isCorrect).length,
      incorrectAnswers: answers.filter(a => !a.isCorrect).length,
      completionTime,
      status: 'completed'
    });
    
    await response.save();
    
    // Update user progress
    await updateUserProgress(userId, quizId, score);
    
    // Update real-time analytics
    const quiz = await Quiz.findById(quizId);
    const stats = await updateLiveQuizStats(quizId, response);
    
    // Emit real-time update
    req.io.to(`quiz-${quizId}`).emit('stats-update', {
      quizId,
      title: quiz.title,
      stats
    });
    
    res.json({ success: true, response, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get live quiz stats
exports.getLiveQuizStats = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const [quiz, responses] = await Promise.all([
      Quiz.findById(quizId),
      UserResponse.find({ quizId })
    ]);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const stats = {
      totalAttempts: responses.length,
      averageScore: responses.reduce((sum, r) => sum + r.score, 0) / (responses.length || 1),
      passRate: responses.filter(r => r.score >= quiz.passingScore).length / (responses.length || 1) * 100,
      recentAttempts: responses.slice(-5).map(r => ({
        userId: r.userId,
        score: r.score,
        time: r.completionTime
      }))
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to update user progress
async function updateUserProgress(userId, quizId, score) {
  const quiz = await Quiz.findById(quizId);
  let progress = await UserProgress.findOne({ userId, quizId });
  
  if (!progress) {
    progress = new UserProgress({
      userId,
      quizId,
      topic: quiz.topic,
      scores: [{ attempt: 1, score, date: new Date() }],
      averageScore: score,
      highestScore: score,
      lowestScore: score,
      totalAttempts: 1,
      lastAttempt: new Date()
    });
  } else {
    progress.scores.push({ 
      attempt: progress.totalAttempts + 1, 
      score, 
      date: new Date() 
    });
    progress.averageScore = 
      (progress.averageScore * progress.totalAttempts + score) / 
      (progress.totalAttempts + 1);
    progress.highestScore = Math.max(progress.highestScore, score);
    progress.lowestScore = Math.min(progress.lowestScore, score);
    progress.totalAttempts += 1;
    progress.lastAttempt = new Date();
  }
  
  await progress.save();
}