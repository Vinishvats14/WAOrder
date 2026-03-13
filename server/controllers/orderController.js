const Order = require('../models/Order');
const Product = require('../models/Product'); // Product model import karna mat bhulna

exports.createOrder = async (req, res) => {
    try {
        const { customerName, customerPhone, address, items, total, sellerId } = req.body;

        const newOrder = new Order({
            customerName,
            customerPhone,
            address,
            items,
            total,
            sellerId
        });

        await newOrder.save();

        // 🔥 YAHAN SE STOCK MINUS HOGA:
        // Har item jo order hua hai, uska stock database mein kam karo
        for (const item of items) {
            await Product.findByIdAndUpdate(item._id, {
                $inc: { stock: -1 } // $inc se value 1 kam ho jayegi
            });
        }

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};