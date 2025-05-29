const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require('../controllers/favoriteController');

router.post('/', auth, addFavorite);
router.get('/', auth, getFavorites);
router.delete('/:propertyId', auth, removeFavorite);

module.exports = router;