exports.isAdmin = (req, res, next) => {
  // Assuming req.user is set by authentication middleware
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admins only.' });
};

// Function to check if user has any of the specified roles
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
  };
}; 