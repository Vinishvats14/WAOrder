const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stock: { type: Number, default: 10 }, // Current maal kitna hai
    minStock: { type: Number, default: 3 }, // Alert kab bajana hai
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);