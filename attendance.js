const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Staff marks attendance
router.post('/', authenticate, authorizeRoles('staff','gym_owner'), async (req, res) => {
  try {
    const { memberId, gymId, status } = req.body;
    const a = new Attendance({ member: memberId, gym: gymId, status: status || 'present' });
    await a.save();
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance for a member
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const records = await Attendance.find({ member: req.params.memberId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
