const User = require('../models/User'); // Admin ki jagah User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. User ko dhoondo
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Seller not found!" });

        // 2. Password check karo
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials!" });

        // 3. Token generate karo
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 4. Sab kuch bhej do frontend ko
        res.json({ 
            token, 
            storeName: user.storeName, 
            whatsappNumber: user.whatsappNumber,
            userId: user._id 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Storefront ke liye dukan ki details nikalna (Slug se)
exports.getStoreBySlug = async (req, res) => {
    try {
        // Hum URL se shopName (slug) utha rahe hain
        const shopName = req.params.shopName;
        console.log("=== SEARCHING FOR STORE ===");
        console.log("Slug from URL:", shopName);
        
        // Try exact match first
        let user = await User.findOne({ storeName: shopName });
        
        if (!user) {
            console.log("Exact match failed, trying case-insensitive...");
            // Try case-insensitive search
            user = await User.findOne({ 
                storeName: { $regex: `^${shopName}$`, $options: 'i' } 
            });
        }
        
        if (!user) {
            console.log("Store not found. Searching all stores to debug...");
            const allUsers = await User.find({}, { storeName: 1 });
            console.log("Available stores:", allUsers);
            return res.status(404).json({ msg: "Dukan nahi mili! Available: " + allUsers.map(u => u.storeName).join(', ') });
        }

        console.log("Store found:", user.storeName);
        console.log("=== END SEARCH ===");

        // Ye data Storefront par dikhega
        res.json({
            _id: user._id,
            storeName: user.storeName,
            whatsappNumber: user.whatsappNumber, 
            themeColor: user.themeColor
        });
    } catch (err) {
        console.error("Store search error:", err);
        res.status(500).json({ error: err.message });
    }
};