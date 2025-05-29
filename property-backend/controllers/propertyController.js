const Property = require('../models/Property');
const { getOrSetCache, invalidateCache } = require('../utils/redis');

exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create({ ...req.body, createdBy: req.user });
    await invalidateCache('properties:*');
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllProperties = async (req, res) => {
  const filters = {};
  const queryFields = [
    'type', 'state', 'city', 'isVerified', 
    'listingType', 'furnished'
  ];

  // Handle title search
  if (req.query.search) {
    filters.title = { $regex: req.query.search, $options: 'i' };
  }

  // Handle string/boolean fields
  queryFields.forEach(field => {
    if (req.query[field] && req.query[field] !== '') {
      if (field === 'furnished') {
        filters[field] = req.query[field] === 'true';
      } else {
        filters[field] = req.query[field];
      }
    }
  });

  // Handle bedrooms and bathrooms as greater than or equal to
  if (req.query.bedrooms && req.query.bedrooms !== '') {
    filters.bedrooms = { $gte: Number(req.query.bedrooms) };
  }

  if (req.query.bathrooms && req.query.bathrooms !== '') {
    filters.bathrooms = { $gte: Number(req.query.bathrooms) };
  }

  // Handle numeric range filters
  if (req.query.minPrice || req.query.maxPrice) {
    filters.price = {};
    if (req.query.minPrice && req.query.minPrice !== '') {
      filters.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice && req.query.maxPrice !== '') {
      filters.price.$lte = Number(req.query.maxPrice);
    }
  }

  if (req.query.minArea || req.query.maxArea) {
    filters.areaSqFt = {};
    if (req.query.minArea && req.query.minArea !== '') {
      filters.areaSqFt.$gte = Number(req.query.minArea);
    }
    if (req.query.maxArea && req.query.maxArea !== '') {
      filters.areaSqFt.$lte = Number(req.query.maxArea);
    }
  }

  if (req.query.rating && req.query.rating !== '') {
    filters.rating = Number(req.query.rating);
  }

  try {
    const cacheKey = `properties:${JSON.stringify(filters)}`;
    const properties = await getOrSetCache(cacheKey, async () => {
      return await Property.find(filters);
    });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.createdBy.toString() !== req.user) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await invalidateCache('properties:*');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.createdBy.toString() !== req.user) return res.status(403).json({ error: 'Unauthorized' });

    await Property.findByIdAndDelete(req.params.id);
    await invalidateCache('properties:*');
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    res.status(500).json({ error: err.message });
  }
};