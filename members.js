const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Member = require('../models/Member');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Add member (gym_owner or staff)
router.post('/', authenticate, authorizeRoles('gym_owner','staff'), async (req, res) => {
  try {
    const { name, email, password, plan } = req.body;
    const gym = req.user.gym || req.body.gym;
    if (!gym) return res.status(400).json({ message: 'Gym is required' });
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password || 'password123', 10);
    const memberUser = new User({ name, email, password: hashed, role: 'member', gym });
    await memberUser.save();
    const member = new Member({ user: memberUser._id, gym, plan });
    await member.save();
    res.json({ member, user: memberUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List members of a gym
router.get('/gym/:gymId', authenticate, async (req, res) => {
  try {
    const members = await Member.find({ gym: req.params.gymId }).populate('user', 'name email');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member (by gym_owner/staff)
router.put('/:id', authenticate, authorizeRoles('gym_owner','staff'), async (req, res) => {
  try {
    const updates = req.body;
    // update member document or user name/email
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (updates.name || updates.email) {
      await User.findByIdAndUpdate(member.user, { name: updates.name, email: updates.email });
    }
    if (updates.plan) member.plan = updates.plan;
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete member (and user)
router.delete('/:id', authenticate, authorizeRoles('gym_owner','staff'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Not found' });
    await User.findByIdAndDelete(member.user);
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
