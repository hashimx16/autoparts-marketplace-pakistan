const Order = require('../models/Order');
const Product = require('../models/Product');

exports.placeOrder = async (req, res) => {
  try {
    const { products } = req.body; // [{ product, quantity }]
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }
    let total = 0;
    // Check stock and calculate total
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (product.quantity < (item.quantity || 1)) {
        return res.status(400).json({ message: `Not enough stock for ${product.title}` });
      }
      total += product.price * (item.quantity || 1);
    }
    // Decrease stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -(item.quantity || 1) } });
    }
    const order = new Order({
      buyer: req.user.userId,
      products,
      total,
      status: 'pending',
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId }).populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    // Get all orders, populate products and their sellers
    const orders = await Order.find()
      .populate({
        path: 'products.product',
        populate: { path: 'seller', select: '_id' }
      });

    // Only include orders that have at least one product belonging to this seller
    const sellerOrders = orders
      .map(order => {
        // Filter products to only those belonging to this seller
        const sellerProducts = order.products.filter(
          item =>
            item.product &&
            item.product.seller &&
            String(item.product.seller._id || item.product.seller) === String(req.user.userId)
        );
        if (sellerProducts.length > 0) {
          // Return a new order object with only the seller's products
          return {
            ...order.toObject(),
            products: sellerProducts
          };
        }
        return null;
      })
      .filter(order => order !== null);

    res.json(sellerOrders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 