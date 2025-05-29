const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  recommendProperty,
  getReceivedRecommendations,
  getSentRecommendations,
  markRecommendationAsRead
} = require('../controllers/recommendationController');

router.post('/', auth, recommendProperty);
router.get('/received', auth, getReceivedRecommendations);
router.get('/sent', auth, getSentRecommendations);
router.patch('/:recommendationId/read', auth, markRecommendationAsRead);

module.exports = router;