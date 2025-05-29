// controllers/recommendationController.js
const User = require('../models/User');
const Property = require('../models/Property');

exports.recommendProperty = async (req, res) => {
  try {
    const { recipientEmail, propertyId, message } = req.body;

    // Find recipient user
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) return res.status(404).json({ error: 'Recipient user not found' });

    // Validate property existence
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    // Add recommendation to recipient
    recipient.recommendationsReceived.push({
      from: req.user,
      property: propertyId,
      message: message || '',
      status: 'unread',
      recommendedAt: new Date()
    });
    await recipient.save();

    res.status(201).json({ message: 'Property recommended successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReceivedRecommendations = async (req, res) => {
  try {    const user = await User.findById(req.user);
    await User.populate(user, {
      path: 'recommendationsReceived',
      populate: [
        {
          path: 'property',
          select: 'title type city address price description images'
        },
        {
          path: 'from',
          model: 'User',
          select: 'name email'
        }
      ]
    });

    res.json(user.recommendationsReceived);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSentRecommendations = async (req, res) => {
  try {
    const recommendations = await User.find({
      'recommendationsReceived.from': req.user
    }).select('name email recommendationsReceived');

    // Populate both property and sender details
    await User.populate(recommendations, [{
      path: 'recommendationsReceived.property',
      model: 'Property',
      select: 'title type city address price description images'
    }, {
      path: 'recommendationsReceived.from',
      model: 'User',
      select: 'name email'
    }]);    const sentRecommendations = recommendations.flatMap(recipient => 
      recipient.recommendationsReceived
        .filter(rec => rec.from._id.toString() === req.user.toString())
        .map(rec => ({
          ...rec.toObject(),
          recipientName: recipient.name,
          recipientEmail: recipient.email
        }))
    );

    res.json(sentRecommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markRecommendationAsRead = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    
    const user = await User.findById(req.user);
    const recommendation = user.recommendationsReceived.id(recommendationId);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    recommendation.status = 'read';
    await user.save();

    res.json({ message: 'Recommendation marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
