const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ResetToken = require('../models/ResetToken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Request password reset - creates token and sends email (or returns token for testing)
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await ResetToken.create({ user: user._id, token, expiresAt: expires });
    // send email via nodemailer (configure SMTP in .env)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    const resetLink = (process.env.APP_URL || 'http://localhost:5000') + '/public/reset-password.html?token=' + token + '&id=' + user._id;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@fitness.com',
      to: user.email,
      subject: 'Password reset',
      text: 'Use this link to reset your password: ' + resetLink,
      html: '<p>Reset link: <a href="'+resetLink+'">'+resetLink+'</a></p>'
    }).catch(err => { console.warn('Email send failed', err); return null; });
    // For testers, return token if SMTP not configured
    res.json({ message: 'Reset requested', token: info ? undefined : token, resetLink: info ? undefined : resetLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete password reset
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    const rt = await ResetToken.findOne({ user: userId, token });
    if (!rt || rt.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired token' });
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashed });
    await ResetToken.deleteMany({ user: userId }); // remove tokens
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stripe demo - create payment intent (requires STRIPE_SECRET)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET || 'sk_test_replace');
    const { amount, currency } = req.body;
    if (!amount) return res.status(400).json({ message: 'amount required (in cents)' });
    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'usd'
    });
    res.json({ clientSecret: intent.client_secret, id: intent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Stripe error', detail: err.message });
  }
});

module.exports = router;
