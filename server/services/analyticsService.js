const UserResponse = require('../models/userResponse');
const UserProgress = require('../models/userProgress');

// Generate analytics data for Chart.js
exports.generateChartData = async (userId, quizId) => {
  let data;
  
  if (quizId) {
    // Quiz-specific analytics
    const responses = await UserResponse.find({ quizId, userId })
      .sort({ completedAt: 1 });
    
    data = {
      labels: responses.map((r, i) => `Attempt ${i + 1}`),
      datasets: [
        {
          label: 'Score',
          data: responses.map(r => r.score),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Time Taken (seconds)',
          data: responses.map(r => r.completionTime),
          borderColor: 'rgb(255, 99, 132)',
          yAxisID: 'y1'
        }
      ]
    };
  } else {
    // User progress across all quizzes
    const progress = await UserProgress.find({ userId })
      .populate('quizId', 'title')
      .sort({ lastAttempt: 1 });
    
    data = {
      labels: progress.map(p => p.quizId.title),
      datasets: [
        {
          label: 'Highest Score',
          data: progress.map(p => p.highestScore),
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        },
        {
          label: 'Average Score',
          data: progress.map(p => p.averageScore),
          backgroundColor: 'rgba(255, 206, 86, 0.5)'
        }
      ]
    };
  }
  
  return data;
};

// Generate question analysis data
exports.generateQuestionAnalysis = async (quizId) => {
  const responses = await UserResponse.find({ quizId });
  const questionStats = {};
  
  responses.forEach(response => {
    response.answers.forEach(answer => {
      if (!questionStats[answer.questionId]) {
        questionStats[answer.questionId] = {
          correct: 0,
          total: 0,
          options: Array(4).fill(0) // Assuming 4 options per question
        };
      }
      questionStats[answer.questionId].total++;
      if (answer.isCorrect) {
        questionStats[answer.questionId].correct++;
      } else {
        questionStats[answer.questionId].options[answer.selectedOption]++;
      }
    });
  });
  
  return Object.entries(questionStats).map(([questionId, stats]) => ({
    questionId,
    accuracy: (stats.correct / stats.total) * 100,
    optionDistribution: stats.options.map((count, i) => ({
      option: i,
      count,
      percentage: (count / stats.total) * 100
    }))
  }));
};