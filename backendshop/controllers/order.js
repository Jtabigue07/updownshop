const connection = require('../config/database');
const sendEmail = require('../utils/sendEmail')

exports.createOrder = (req, res) => {
    console.log('req.user:', req.user);
    console.log('createOrder called', JSON.stringify(req.body, null, 2));
    // Use user ID from authentication middleware
    const userId = req.user && req.user.id;
    if (!userId) {
        console.log('No authenticated user found');
        return res.status(401).json({ error: 'Unauthorized: No user found' });
        }
    const { cart, total } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        console.log('Cart is empty or invalid:', cart);
        return res.status(400).json({ error: 'Cart is empty' });
    }
    // Insert into orderinfo
    connection.execute(
        'INSERT INTO orderinfo (user_id, total) VALUES (?, ?)',
        [userId, total],
        (err, result) => {
            if (err) {
                console.log('Orderinfo insert error:', err);
                return res.status(500).json({ error: err });
                    }
            const orderId = result.insertId;
            console.log('Inserted orderinfo, orderId:', orderId);
            // Insert order lines
            const lines = cart.map(item => [orderId, item.product_id, item.qty, item.price]);
            console.log('Order lines to insert:', lines);
            connection.query(
                'INSERT INTO orderline (order_id, product_id, quantity, price) VALUES ?',
                [lines],
                (err2) => {
                    if (err2) {
                        console.log('Orderline insert error:', err2);
                        return res.status(500).json({ error: err2 });
                    }
                    console.log('Orderline insert success');
                    res.json({ success: true, orderId });
                        }
            );
        }
    );
};

exports.getOrders = (req, res) => {
  const userId = req.user.id;
  connection.query(
    'SELECT * FROM orderinfo WHERE user_id = ? ORDER BY order_date DESC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
};

// Admin: Get all orders
exports.getAllOrders = (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
                        }
  connection.query(
    `SELECT o.*, u.name as user_name, u.email as user_email FROM orderinfo o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.order_date DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
};

// Admin: Update order status
exports.updateOrderStatus = (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
                                }
  const { orderId } = req.params;
  const { status } = req.body;
  const allowed = ['Pending', 'Verified', 'Shipped', 'Delivered'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  connection.query(
    'UPDATE orderinfo SET status = ? WHERE id = ?',
    [status, orderId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
                                        }
  );
};

// Get order lines for a specific order (only for the owner)
exports.getOrderLines = (req, res) => {
  const userId = req.user.id;
  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ error: 'Missing order_id' });
  // Check if the order belongs to the user and is delivered
  const sql = `SELECT ol.product_id, p.name as product_name, ol.quantity
    FROM orderline ol
    JOIN orderinfo o ON ol.order_id = o.id
    JOIN products p ON ol.product_id = p.id
    WHERE ol.order_id = ? AND o.user_id = ? AND o.status = 'Delivered'`;
  // Only show products for delivered orders of the current user
  connection.query(sql, [order_id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
                    });
};

