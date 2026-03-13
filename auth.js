const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    await user.save();
    res.json({message: "User registered"});
  } catch(err){
    res.status(500).json(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).json("User not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).json("Invalid password");

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
    res.json({token});

  } catch(err){
    res.status(500).json(err);
  }
});

module.exports = router;
