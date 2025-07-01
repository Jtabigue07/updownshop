const connection = require('../config/database');

// Get all products
exports.getAllProducts = (req, res) => {
  const sql = `SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON p.category_id = c.id`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Get one product
exports.getProduct = (req, res) => {
  const sql = `SELECT * FROM products WHERE id = ?`;
  connection.execute(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
};

// Create product
exports.createProduct = (req, res) => {
  const { name, price, stock, category_id } = req.body;
  const image = req.file ? 'images/' + req.file.filename : null;
  const sql = `INSERT INTO products (name, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?)`;
  connection.execute(sql, [name, price, stock, category_id, image], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, name, price, stock, category_id, image });
  });
};

// Update product
exports.updateProduct = (req, res) => {
  const { name, price, stock, category_id } = req.body;
  const image = req.file ? 'images/' + req.file.filename : req.body.existingImage;
  const sql = `UPDATE products SET name=?, price=?, stock=?, category_id=?, image=? WHERE id=?`;
  connection.execute(sql, [name, price, stock, category_id, image, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: req.params.id, name, price, stock, category_id, image });
  });
};

// Delete product
exports.deleteProduct = (req, res) => {
  const sql = `DELETE FROM products WHERE id = ?`;
  connection.execute(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
};

// Get all categories (only Smartphones, Laptops, Accessories, Tablets)
exports.getAllCategories = (req, res) => {
  const sql = `SELECT id, name FROM categories WHERE name IN ('Smartphones', 'Laptops', 'Accessories', 'Tablets') ORDER BY FIELD(name, 'Smartphones', 'Laptops', 'Accessories', 'Tablets')`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
}; 