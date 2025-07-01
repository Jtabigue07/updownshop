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

