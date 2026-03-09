const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/productController');
const Product = require('../models/Product'); // Direct model use kar rahe hain yahan simplicity ke liye
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Jo middleware humne abhi banaya

router.get('/', getProducts);

// POST route ko update kiya: auth aur upload middleware ke saath
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const newProduct = new Product({
            name,
            price,
            description,
            image: req.file.path // Cloudinary ka URL req.file mein hota hai
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ msg: "Upload failed" });
    }
});

module.exports = router;