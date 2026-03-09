const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.post('/', createOrder); // Customer bina login ke order kar sakta hai
router.get('/', auth, getOrders); // Sirf Admin orders dekh sakta hai

module.exports = router;