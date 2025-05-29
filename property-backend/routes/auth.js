const express = require('express');
const { register, login, searchUsers } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/search', auth, searchUsers);

module.exports = router;