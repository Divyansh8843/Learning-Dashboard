const UserResponse = require('../models/userResponse');
const UserProgress = require('../models/userProgress');
const Quiz = require('../models/Quiz');
const { calculateQuizStats, calculateUserStats } = require('../utils/calculateStats');

// Get real-time quiz analytics
exports.getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const responses = await UserResponse.find({ quizId });
    const stats = calculateQuizStats(responses, quiz.questions.length);

    res.json({
      success: true,
      analytics: {
        quizId,
        title: quiz.title,
        totalAttempts: responses.length,
        ...stats,
        questionStats: await getQuestionStats(quizId)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user progress analytics
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progress = await UserProgress.find({ userId })
      .populate('quizId', 'title topic')
      .sort({ lastAttempt: -1 });

    if (!progress || progress.length === 0) {
      return res.status(404).json({ error: 'No progress data found' });
    }

    const stats = calculateUserStats(progress);

    res.json({
      success: true,
      progress,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get comparative analytics
exports.getComparativeAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const [quiz, responses, averageStats] = await Promise.all([
      Quiz.findById(quizId),
      UserResponse.find({ quizId }),
      UserResponse.aggregate([
        { $match: { quizId: mongoose.Types.ObjectId(quizId) } },
        { $group: { 
          _id: null,
          avgScore: { $avg: "$score" },
          maxScore: { $max: "$score" },
          minScore: { $min: "$score" },
          totalAttempts: { $sum: 1 }
        }}
      ])
    ]);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      success: true,
      quiz: {
        title: quiz.title,
        topic: quiz.topic,
        passingScore: quiz.passingScore
      },
      analytics: {
        averageScore: averageStats[0]?.avgScore || 0,
        highestScore: averageStats[0]?.maxScore || 0,
        lowestScore: averageStats[0]?.minScore || 0,
        totalAttempts: averageStats[0]?.totalAttempts || 0,
        passRate: responses.filter(r => r.score >= quiz.passingScore).length / (responses.length || 1) * 100,
        completionTimes: responses.map(r => r.completionTime),
        scoreDistribution: getScoreDistribution(responses)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper functions
async function getQuestionStats(quizId) {
  const responses = await UserResponse.find({ quizId });
  const questionStats = {};
  
  responses.forEach(response => {
    response.answers.forEach(answer => {
      if (!questionStats[answer.questionId]) {
        questionStats[answer.questionId] = {
          correct: 0,
          incorrect: 0,
          total: 0
        };
      }
      questionStats[answer.questionId].total++;
      if (answer.isCorrect) {
        questionStats[answer.questionId].correct++;
      } else {
        questionStats[answer.questionId].incorrect++;
      }
    });
  });
  
  return questionStats;
}

function getScoreDistribution(responses) {
  const distribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };
  
  responses.forEach(response => {
    const score = response.score;
    if (score <= 20) distribution['0-20']++;
    else if (score <= 40) distribution['21-40']++;
    else if (score <= 60) distribution['41-60']++;
    else if (score <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });
  
  return distribution;
}