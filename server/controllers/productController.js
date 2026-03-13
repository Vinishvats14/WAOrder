const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, description, sellerId, stock, minStock } = req.body;
        console.log("Backend Received:", { stock, minStock });
        
        // Properly parse stock and minStock
        const parsedStock = stock && stock !== '' ? Number(stock) : 10;
        const parsedMinStock = minStock && minStock !== '' ? Number(minStock) : 3;
        
        console.log("Parsed Values:", { parsedStock, parsedMinStock });
        
        const newProduct = new Product({
            name,
            price,
            description,
            sellerId,
            stock: parsedStock,
            minStock: parsedMinStock,
            image: req.file ? req.file.path : ''
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};