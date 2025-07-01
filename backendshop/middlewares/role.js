exports.isAdmin = (req, res, next) => {
  // Assuming req.user is set by authentication middleware
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admins only.' });
}; 