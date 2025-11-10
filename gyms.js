const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create gym - only platform owner or gym_owner can create (adjust as needed)
router.post('/', authenticate, authorizeRoles('owner','gym_owner'), async (req, res) => {
  try {
    const { name, address } = req.body;
    const gym = new Gym({ name, address, owner: req.user._id });
    await gym.save();
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List gyms
router.get('/', authenticate, async (req, res) => {
  try {
    const gyms = await Gym.find().populate('owner', 'name email');
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
