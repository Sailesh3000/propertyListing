// controllers/favoriteController.js
const User = require('../models/User');
const Property = require('../models/Property');
const { getOrSetCache, invalidateCache } = require('../utils/redis');

exports.addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;

    // Check property exists
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const user = await User.findById(req.user);

    if (user.favorites.includes(propertyId)) {
      return res.status(400).json({ error: 'Already in favorites' });
    }

    user.favorites.push(propertyId);
    await user.save();
    
    // Invalidate user's favorites cache
    await invalidateCache(`favorites:${req.user}`);

    res.status(201).json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const cacheKey = `favorites:${req.user}`;
    const favorites = await getOrSetCache(cacheKey, async () => {
      const user = await User.findById(req.user).populate('favorites');
      return user.favorites;
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.propertyId
    );
    await user.save();

    // Invalidate user's favorites cache
    await invalidateCache(`favorites:${req.user}`);

    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
