const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  loans: [
    {
      amount: Number,
      interest: Number,
      status: { type: String, default: 'pending' },
      dueDate: Date
    }
  ]
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);

