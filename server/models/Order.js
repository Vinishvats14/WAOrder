const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    items: Array,
    total: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);