const connection = require('../config/database');

// Add a review (user, only if order delivered)
exports.addReview = (req, res) => {
  const userId = req.user.id;
  const { product_id, rating, comment } = req.body;
  // Check if user has a delivered order for this product
  const sql = `SELECT ol.id FROM orderline ol
    JOIN orderinfo o ON ol.order_id = o.id
    WHERE ol.product_id = ? AND o.user_id = ? AND o.status = 'Delivered'`;
  connection.query(sql, [product_id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(403).json({ error: 'You can only review products you have purchased and received.' });
    }
    // Check if review already exists
    const checkReview = `SELECT id FROM reviews WHERE product_id = ? AND user_id = ?`;
    connection.query(checkReview, [product_id, userId], (err3, found) => {
      if (err3) return res.status(500).json({ error: err3 });
      if (found.length > 0) {
        // Update existing review
        const update = `UPDATE reviews SET rating = ?, comment = ? WHERE product_id = ? AND user_id = ?`;
        connection.query(update, [rating, comment, product_id, userId], (err4) => {
          if (err4) return res.status(500).json({ error: err4 });
          res.status(200).json({ success: true, updated: true });
        });
      } else {
        // Insert new review
        const insert = `INSERT INTO reviews (product_id, user_id, rating, comment, status) VALUES (?, ?, ?, ?, 'approved')`;
        connection.query(insert, [product_id, userId, rating, comment], (err2, result) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.status(201).json({ success: true, id: result.insertId });
        });
      }
    });
  });
};

// Get reviews for a product (public, only approved)
exports.getProductReviews = (req, res) => {
  const { product_id } = req.query;
  const sql = `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? AND r.status = 'approved' ORDER BY r.created_at DESC`;
  connection.query(sql, [product_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Admin: List all reviews
exports.listAllReviews = (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  let sql = `SELECT r.*, u.name as user_name, p.name as product_name FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC`;
  connection.query(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Admin: Delete a review
exports.deleteReview = (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  const { id } = req.params;
  const sql = `DELETE FROM reviews WHERE id = ?`;
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
};

// Get the current user's review for a product
exports.getMyReview = (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.query;
  if (!product_id) return res.status(400).json({ error: 'Missing product_id' });
  const sql = `SELECT * FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1`;
  connection.query(sql, [product_id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.json(null);
    res.json(results[0]);
  });
};

// Update the current user's review for a product
exports.updateMyReview = (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;
  const { rating, comment } = req.body;
  if (!product_id) return res.status(400).json({ error: 'Missing product_id' });
  // Only allow update if the review exists and belongs to the user
  const sql = `UPDATE reviews SET rating = ?, comment = ? WHERE product_id = ? AND user_id = ?`;
  connection.query(sql, [rating, comment, product_id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  });
};

// User: Delete their own review for a product
exports.deleteMyReview = (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;
  if (!product_id) return res.status(400).json({ error: 'Missing product_id' });
  const sql = `DELETE FROM reviews WHERE product_id = ? AND user_id = ?`;
  connection.query(sql, [product_id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  });
}; 