const UserResponse = require('../models/userResponse');
const Quiz = require('../models/Quiz');

// Update live quiz statistics
exports.updateLiveQuizStats = async (quizId, newResponse) => {
  const [quiz, responses] = await Promise.all([
    Quiz.findById(quizId),
    UserResponse.find({ quizId })
  ]);
  
  const stats = {
    totalAttempts: responses.length,
    averageScore: responses.reduce((sum, r) => sum + r.score, 0) / responses.length,
    passRate: responses.filter(r => r.score >= quiz.passingScore).length / responses.length * 100,
    scoreDistribution: getScoreDistribution(responses),
    questionAccuracy: await getQuestionAccuracy(quizId)
  };
  
  return stats;
};

// Get question accuracy stats
async function getQuestionAccuracy(quizId) {
  const responses = await UserResponse.find({ quizId });
  const questionStats = {};
  
  responses.forEach(response => {
    response.answers.forEach(answer => {
      if (!questionStats[answer.questionId]) {
        questionStats[answer.questionId] = { correct: 0, total: 0 };
      }
      questionStats[answer.questionId].total++;
      if (answer.isCorrect) {
        questionStats[answer.questionId].correct++;
      }
    });
  });
  
  return Object.entries(questionStats).map(([questionId, stats]) => ({
    questionId,
    accuracy: (stats.correct / stats.total) * 100
  }));
}

function getScoreDistribution(responses) {
  const distribution = Array(10).fill(0); // 0-10, 11-20, ..., 91-100
  
  responses.forEach(response => {
    const bucket = Math.floor(response.score / 10);
    distribution[bucket === 10 ? 9 : bucket]++;
  });
  
  return distribution.map((count, i) => ({
    range: `${i * 10}-${i * 10 + 10}`,
    count
  }));
}