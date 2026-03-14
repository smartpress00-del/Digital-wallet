const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json("Access Denied");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json("Invalid Token");
  }
};

// Request Loan
router.post('/request', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { amount, interest, dueDate } = req.body;

    user.loans.push({
      amount: amount,
      interest: interest,
      status: "approved",
      dueDate: dueDate
    });

    user.walletBalance += amount;

    await user.save();

    res.json({
      message: "Loan approved",
      balance: user.walletBalance
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

// Repay Loan
router.post('/repay', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const loan = user.loans.find(l => l.status === "approved");

    if (!loan) {
      return res.status(400).json("No active loan");
    }

    const totalDue = loan.amount + (loan.amount * loan.interest / 100);

    if (user.walletBalance < totalDue) {
      return res.status(400).json("Insufficient balance");
    }

    user.walletBalance -= totalDue;

    loan.status = "repaid";

    await user.save();

    res.json({
      message: "Loan repaid successfully",
      balance: user.walletBalance
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
