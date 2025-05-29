const Joi = require('joi');

exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6)
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

exports.validateProperty = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    type: Joi.string().required().valid('house', 'apartment', 'condo', 'townhouse'),
    price: Joi.number().required().min(0),
    bedrooms: Joi.number().required().min(0),
    bathrooms: Joi.number().required().min(0),
    areaSqFt: Joi.number().required().min(0),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    listingType: Joi.string().required().valid('sale', 'rent'),
    furnished: Joi.boolean(),
    parking: Joi.boolean(),
    images: Joi.array().items(Joi.string()),
    amenities: Joi.array().items(Joi.string()),
    availableFrom: Joi.date()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
