const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
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

module.exports = mongoose.model('User', UserSchema);
