const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// 1. Database Connection
connectDB();

// 2. CORS Configuration
app.use(cors({
    // Ab ye Environment variable se URL uthayega
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true
}));

app.use(express.json());

// 3. Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// index.js ke end mein:
const PORT = process.env.PORT || 5009; // Render apna port khud provide karega
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
