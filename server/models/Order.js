const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Sabse Important!
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, required: true },
    items: [{
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);