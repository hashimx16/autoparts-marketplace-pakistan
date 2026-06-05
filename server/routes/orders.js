const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, isBuyer, isSeller } = require('../middleware/auth');

// Buyer places order
router.post('/', auth, isBuyer, orderController.placeOrder);
// Buyer views their orders
router.get('/buyer', auth, isBuyer, orderController.getBuyerOrders);
// Seller views orders for their products
router.get('/seller', auth, isSeller, orderController.getSellerOrders);

module.exports = router; 