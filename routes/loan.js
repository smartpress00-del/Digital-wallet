const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth'); // ✅ centralized middleware
const router = express.Router();

// Request a loan
router.post('/request', auth, async (req, res) => {
  try {
    const { amount, interest, dueDate } = req.body;
    if (amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be positive' });
    if (interest < 0) return res.status(400).json({ success: false, message: 'Interest must be non-negative' });

    const user = await User.findById(req.user.id);

    user.loans.push({
      amount,
      interest,
      status: 'pending',
      dueDate,
      remainingBalance: amount + (amount * interest / 100) // ✅ includes interest
    });

    await user.save();
    res.json({ success: true, message: 'Loan request submitted', loans: user.loans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get loan status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, loans: user.loans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Repay a loan
router.post('/repay', auth, async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be positive' });

    const user = await User.findById(req.user.id);
    const loan = user.loans.id(loanId);

    if (!loan || loan.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Loan not found or already repaid' });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct repayment
    user.walletBalance -= amount;
    loan.remainingBalance -= amount;

    if (loan.remainingBalance <= 0) loan.status = 'repaid';

    await user.save();
    res.json({ success: true, message: 'Repayment successful', balance: user.walletBalance, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

