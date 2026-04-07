const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { askRateLimiter } = require('../middleware/rateLimiter');
const { ask, getHistory } = require('../controllers/askController');

// Both routes require auth
router.use(authMiddleware);

router.post('/', askRateLimiter, ask);
router.get('/history', getHistory);  // Bonus endpoint

module.exports = router;