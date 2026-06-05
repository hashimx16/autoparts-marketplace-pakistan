const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isSeller } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Seller only
router.post('/', auth, isSeller, upload.array('images', 5), productController.createProduct);
router.put('/:id', auth, isSeller, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', auth, isSeller, productController.deleteProduct);
router.get('/seller/listings', auth, isSeller, productController.getSellerProducts);

module.exports = router; 