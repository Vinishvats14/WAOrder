const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    storeName: { type: String, required: true, unique: true }, // Unique Store Name (e.g., "vinish-bakery")
    whatsappNumber: { type: String, required: true }, // Seller ka apna WA number
    themeColor: { type: String, default: '#22c55e' }, // Default Green
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);