
module.exports.chatbot=async(req,res,next)=>
{
        try {
            const { message } = req.body;
            const botResponse = await chatWithAI(message);
            res.json({ reply: botResponse });
          } catch (error) {
            res.status(500).json({ error: "Chatbot Error" });
          }
}
module.exports.recommend=async(req,res,next)=>
{
    try {
        const { interest } = req.body;
        const recommendation = recommendAI(interest);
        res.json({ recommendation });
      } catch (error) {
        res.status(500).json({ error: "Recommendation Error" });
      }
}
module.exports.analyze=async(req,res,next)=>
{
    try {
        const { quizResults } = req.body;
        
        let totalQuestions = quizResults.length;
        let correctAnswers = quizResults.filter(q => q.isCorrect).length;
        let incorrectAnswers = totalQuestions - correctAnswers;
        let accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(2);

        // Trend Analysis (e.g., category-wise accuracy)
        let categoryStats = {};
        quizResults.forEach(q => {
            if (!categoryStats[q.category]) {
                categoryStats[q.category] = { correct: 0, total: 0 };
            }
            categoryStats[q.category].total += 1;
            if (q.isCorrect) {
                categoryStats[q.category].correct += 1;
            }
        });

        let categoryPerformance = Object.keys(categoryStats).map(category => ({
            category,
            accuracy: ((categoryStats[category].correct / categoryStats[category].total) * 100).toFixed(2)
        }));

        res.json({
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            accuracy,
            categoryPerformance
        });
    } catch (error) {
        res.status(500).json({ error: "Quiz Analysis Error" });
    }
}