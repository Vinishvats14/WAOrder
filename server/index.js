const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// 1. Database Connection
connectDB();

// 2. CORS Configuration
app.use(cors({
    origin: 'https://wa-order.vercel.app', // Bilkul yahi URL hona chahiye
    credentials: true, // Sabse zaroori line
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pre-flight requests ko handle karne ke liye ye zaroor daalein
app.options('*', cors());

app.use(express.json());

// 3. Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// index.js ke end mein:
const PORT = process.env.PORT || 5009; // Render apna port khud provide karega
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
