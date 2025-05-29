const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');

router.post('/', auth, createProperty);
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

module.exports = router;
