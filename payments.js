const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Record a payment (staff or gym_owner)
router.post('/', authenticate, authorizeRoles('staff','gym_owner'), async (req, res) => {
  try {
    const { memberId, gymId, amount, method, transactionId } = req.body;
    const p = new Payment({ member: memberId, gym: gymId, amount, method, transactionId });
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payments for a member
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ member: req.params.memberId }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payments for a gym
router.get('/gym/:gymId', authenticate, authorizeRoles('gym_owner','owner'), async (req, res) => {
  try {
    const payments = await Payment.find({ gym: req.params.gymId }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
