const express = require('express');
const router = express.Router();

// Simple test route
router.get('/', (req, res) => {
  res.send('Auth route is working successfully!');
});

module.exports = router;
