const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.isSeller = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Access denied: Sellers only' });
  }
  next();
};

exports.isBuyer = (req, res, next) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Access denied: Buyers only' });
  }
  next();
}; 