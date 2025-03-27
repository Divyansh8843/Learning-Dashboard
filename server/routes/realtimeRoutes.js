const express = require('express');
const router = express.Router();
const realtimeController = require('../controllers/realtimeController');
const {isLoggedIn} = require('../Middleware');

// Real-time tracking
router.post('/track/:quizId/:userId', isLoggedIn, realtimeController.trackQuizAttempt);
router.get('/live/:quizId', isLoggedIn, realtimeController.getLiveQuizStats);

module.exports = router;
