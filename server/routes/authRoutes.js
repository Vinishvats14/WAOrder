const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { login } = require('../controllers/authController');
const authController = require('../controllers/authController');
// Register logic yahi rehne de sakte ho ya isko bhi controller mein daal sakte ho
router.post('/register', async (req, res) => {
    try {
        const { email, password, storeName, whatsappNumber } = req.body;

        const existingStore = await User.findOne({ storeName });
        if (existingStore) return res.status(400).json({ msg: "Store name already taken!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            email,
            password: hashedPassword,
            storeName: storeName.toLowerCase().replace(/\s+/g, '-'),
            whatsappNumber
        });

        await newUser.save();
        res.status(201).json({ msg: "Seller Registered Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', login);
// Get Seller Details by Store Name
router.get('/store/:shopName', authController.getStoreBySlug);
// Settings ke liye data nikalna ID se
router.get('/store-by-id/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update Seller Settings
router.patch('/settings/:userId', async (req, res) => {
    try {
        const { whatsappNumber, storeName, themeColor } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { whatsappNumber, storeName, themeColor } },
            { new: true }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;