// Calculate quiz statistics
exports.calculateQuizStats = (responses, totalQuestions) => {
    if (responses.length === 0) {
      return {
        averageScore: 0,
        averageTime: 0,
        completionRate: 0,
        questionAccuracy: {}
      };
    }
    
    const totalScores = responses.reduce((sum, r) => sum + r.score, 0);
    const totalTimes = responses.reduce((sum, r) => sum + (r.completionTime || 0), 0);
    
    return {
      averageScore: totalScores / responses.length,
      averageTime: totalTimes / responses.length,
      completionRate: (responses.filter(r => r.status === 'completed').length / responses.length) * 100,
      totalAttempts: responses.length
    };
  };
  
  // Calculate user statistics
  exports.calculateUserStats = (progressRecords) => {
    if (progressRecords.length === 0) {
      return {
        overallAverage: 0,
        improvementRate: 0,
        strongestTopic: null,
        weakestTopic: null
      };
    }
    
    const topics = {};
    let totalScore = 0;
    let totalAttempts = 0;
    
    progressRecords.forEach(record => {
      totalScore += record.averageScore * record.totalAttempts;
      totalAttempts += record.totalAttempts;
      
      if (!topics[record.topic]) {
        topics[record.topic] = {
          totalScore: 0,
          totalAttempts: 0
        };
      }
      topics[record.topic].totalScore += record.averageScore * record.totalAttempts;
      topics[record.topic].totalAttempts += record.totalAttempts;
    });
    
    // Calculate topic averages
    const topicAverages = Object.entries(topics).map(([topic, stats]) => ({
      topic,
      averageScore: stats.totalScore / stats.totalAttempts
    }));
    
    // Sort by average score
    topicAverages.sort((a, b) => b.averageScore - a.averageScore);
    
    return {
      overallAverage: totalScore / totalAttempts,
      strongestTopic: topicAverages[0]?.topic || null,
      strongestScore: topicAverages[0]?.averageScore || 0,
      weakestTopic: topicAverages[topicAverages.length - 1]?.topic || null,
      weakestScore: topicAverages[topicAverages.length - 1]?.averageScore || 0,
      totalQuizzesAttempted: progressRecords.length
    };
  };