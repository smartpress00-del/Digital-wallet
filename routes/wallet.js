const auth = require('../middleware/auth');
// routes/wallet.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Deposit funds
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

    const user = await User.findById(req.user.id);
    user.walletBalance += amount;
    await user.save();

    res.json({ success: true, balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer funds
router.post('/transfer', auth, async (req, res) => {
  try {
    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: req.body.to });
    if (!receiver) return res.status(400).json({ message: 'Receiver not found' });
    if (sender.walletBalance < req.body.amount) return res.status(400).json({ message: 'Insufficient balance' });

    sender.walletBalance -= req.body.amount;
    receiver.walletBalance += req.body.amount;

    await sender.save();
    await receiver.save();

    res.json({ message: 'Transfer successful', senderBalance: sender.walletBalance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
