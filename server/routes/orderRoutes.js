const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware'); // Check karna ye path sahi ho

// 1. Customer Order (No Auth Needed)
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Dashboard ke liye (Auth Needed)
router.get('/seller/:sellerId', auth, async (req, res) => {
    try {
        const orders = await Order.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Status Update (Auth Needed)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Sales Analytics for last 7 days
router.get('/analytics/:sellerId', auth, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const orders = await Order.find({
            sellerId: req.params.sellerId,
            createdAt: { $gte: sevenDaysAgo }
        });

        // Data ko days ke hisaab se group karo
        const salesData = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
            salesData[date] = (salesData[date] || 0) + order.total;
        });

        res.json(salesData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Order status update karne ke liye
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;