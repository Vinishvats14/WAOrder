const express = require('express');
const { Server } = require("socket.io");
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); // Naya import
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Server setup

// 1. Database Connection
connectDB();

// 2. Updated CORS (Local + Production)
const allowedOrigins = ['https://wa-order.vercel.app', 'http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: ["https://wa-order.vercel.app", "http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});

// Live Visitors Tracking Logic
let activeUsers = 0;

io.on("connection", (socket) => {
    activeUsers++;
    io.emit("visitorCount", activeUsers); // Sabko batao kitne log hain

    // Jab koi Cart mein kuch daale
    socket.on("cartActivity", (data) => {
        // Ye message sirf Admin ko jayega
        socket.broadcast.emit("adminNotification", {
            message: `Someone added ${data.productName} to cart!`,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on("disconnect", () => {
        activeUsers--;
        io.emit("visitorCount", activeUsers);
    });
});

// 3. Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// 4. Final Port Fix for Render
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
