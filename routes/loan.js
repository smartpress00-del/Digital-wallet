const auth = require('../middleware/auth');
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Request a loan
router.post('/request', auth, async (req, res) => {
  try {
    const { amount, interest, dueDate } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

    const user = await User.findById(req.user.id);
    user.loans.push({ amount, interest, status: 'pending', dueDate });
    await user.save();

    res.json({ success: true, message: 'Loan request submitted', loans: user.loans });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get loan status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ loans: user.loans });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Repay a loan
router.post('/repay', auth, async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    const user = await User.findById(req.user.id);

    const loan = user.loans.id(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

    // Deduct repayment from wallet
    if (user.walletBalance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    user.walletBalance -= amount;

    loan.amount -= amount;
    if (loan.amount <= 0) loan.status = 'repaid';

    await user.save();
    res.json({ success: true, message: 'Repayment successful', loan });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
