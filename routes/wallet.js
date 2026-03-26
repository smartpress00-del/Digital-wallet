const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth'); // ✅ centralized middleware
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Deposit funds
router.post('/deposit',
  auth,
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const user = await User.findById(req.user.id);
      user.walletBalance += req.body.amount;
      await user.save();
      res.json({ success: true, message: 'Deposit successful', balance: user.walletBalance });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// Transfer funds
router.post('/transfer',
  auth,
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { recipientId, amount } = req.body;
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(recipientId);

      if (!receiver) return res.status(404).json({ success: false, message: 'Recipient not found' });
      if (sender.walletBalance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

      sender.walletBalance -= amount;
      receiver.walletBalance += amount;

      // ✅ Atomic save
      await Promise.all([sender.save(), receiver.save()]);

      res.json({ success: true, message: 'Transfer successful', balance: sender.walletBalance });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;

