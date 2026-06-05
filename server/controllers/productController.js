const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, quantity } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];
    const product = new Product({
      title,
      description,
      price,
      images,
      seller: req.user.userId,
      quantity: quantity || 1,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice } = req.query;
    let filter = { isActive: true, quantity: { $gt: 0 } };
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const products = await Product.find(filter).populate('seller', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, quantity } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.filename);
    }
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deleted (soft delete)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId, isActive: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 