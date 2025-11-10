const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Create staff (by gym_owner)
router.post('/', authenticate, authorizeRoles('gym_owner'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const gym = req.user.gym;
    if (!gym) return res.status(400).json({ message: 'Gym not set for creator' });
    if (!name || !email) return res.status(400).json({ message: 'Missing fields' });
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email exists' });
    const hashed = await bcrypt.hash(password || 'password123', 10);
    const staff = new User({ name, email, password: hashed, role: 'staff', gym });
    await staff.save();
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List staff by gym
router.get('/gym/:gymId', authenticate, async (req, res) => {
  try {
    const staff = await User.find({ gym: req.params.gymId, role: 'staff' }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update staff
router.put('/:id', authenticate, authorizeRoles('gym_owner'), async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    const s = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete staff
router.delete('/:id', authenticate, authorizeRoles('gym_owner'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
