const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. Get products by Seller ID (Storefront ke liye)
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.params.sellerId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add Product (Auth middleware zaroori hai)
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, stock, minStock } = req.body;
        
        console.log("=== ROUTE RECEIVED ===");
        console.log("Raw stock:", stock, `(type: ${typeof stock})`);
        console.log("Raw minStock:", minStock, `(type: ${typeof minStock})`);
        
        // Properly parse stock and minStock - handle string inputs from FormData
        let parsedStock = Number(stock);
        let parsedMinStock = Number(minStock);
        
        // If parsing results in NaN or invalid, use defaults
        if (isNaN(parsedStock) || parsedStock <= 0) {
            parsedStock = 10;
        }
        if (isNaN(parsedMinStock) || parsedMinStock <= 0) {
            parsedMinStock = 3;
        }
        
        console.log("Parsed stock:", parsedStock);
        console.log("Parsed minStock:", parsedMinStock);
        console.log("=== END ROUTE ===");
        
        const newProduct = new Product({
            name,
            price,
            description,
            stock: parsedStock,
            minStock: parsedMinStock,
            image: req.file ? req.file.path : '', // Cloudinary URL
            sellerId: req.adminId // Seller se link karo
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Product add error:", err);
        res.status(500).json({ msg: "Upload failed" });
    }
});

// 1. Delete Product - WITH SELLER VERIFICATION
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: "Product nahi mila" });

        // CRITICAL: Check if THIS seller owns THIS product
        if (product.sellerId.toString() !== req.adminId) {
            return res.status(403).json({ msg: "Unauthorized - Ye product aapka nahi hai!" });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: "Maal saaf! Product deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Update Product (Price ya Name badalne ke liye) - WITH SELLER VERIFICATION
router.patch('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: "Product nahi mila" });
        
        // CRITICAL: Check if THIS seller owns THIS product
        if (product.sellerId.toString() !== req.adminId) {
            return res.status(403).json({ msg: "Unauthorized - Ye product aapka nahi hai!" });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;