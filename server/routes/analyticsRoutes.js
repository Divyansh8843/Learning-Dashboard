const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const {isLoggedIn} = require('../Middleware');

// Quiz analytics
router.get('/quiz/:quizId', isLoggedIn, analyticsController.getQuizAnalytics);
router.get('/quiz/:quizId/comparative', isLoggedIn, analyticsController.getComparativeAnalytics);

// User progress
router.get('/user/:userId', isLoggedIn, analyticsController.getUserProgress);

module.exports = router;