const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware
const auth = (req, res, next) => {
    const token = req.header('auth-token');
    if(!token) return res.status(401).json("Access Denied");
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch(err) { res.status(400).json("Invalid Token"); }
}

// Deposit
router.post('/deposit', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.walletBalance += req.body.amount;
        await user.save();
        res.json({ message: "Deposit successful", balance: user.walletBalance });
    } catch(err) { res.status(500).json(err); }
});

// Transfer
router.post('/transfer', auth, async (req, res) => {
    try {
        const sender = await User.findById(req.user.id);
        const receiver = await User.findOne({ email: req.body.to });
        if(!receiver) return res.status(400).json("Receiver not found");
        if(sender.walletBalance < req.body.amount) return res.status(400).json("Insufficient balance");

        sender.walletBalance -= req.body.amount;
        receiver.walletBalance += req.body.amount;

        await sender.save();
        await receiver.save();

        res.json({ message: "Transfer successful", senderBalance: sender.walletBalance });
    } catch(err) { res.status(500).json(err); }
});

module.exports = router;
