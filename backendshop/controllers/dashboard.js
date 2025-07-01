const connection = require('../config/database');

exports.addressChart = (req, res) => {
    const sql = 'SELECT count(addressline) as total, addressline FROM customer GROUP BY addressline ORDER BY total DESC';
    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return;
            }
            return res.status(200).json({
                rows,
            })
        });
    } catch (error) {
        console.log(error)
    }


};

exports.salesChart = (req, res) => {
    const sql = 'SELECT monthname(oi.date_placed) as month, sum(ol.quantity * i.sell_price) as total FROM orderinfo oi INNER JOIN orderline ol ON oi.orderinfo_id = ol.orderinfo_id INNER JOIN item i ON i.item_id = ol.item_id GROUP BY month(oi.date_placed)';
    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return;
            }
            return res.status(200).json({
                rows,
            })
        });
    } catch (error) {
        console.log(error)
    }


};

exports.itemsChart = (req, res) => {
    const sql = 'SELECT i.description as items, sum(ol.quantity) as total FROM item i INNER JOIN orderline ol ON i.item_id = ol.item_id GROUP BY i.description';
    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return;
            }
            return res.status(200).json({
                rows,
            })
        });
    } catch (error) {
        console.log(error)
    }


};

// Bar Chart: Sales by Category (sum of quantity per category for successful orders)
exports.salesByCategory = (req, res) => {
  const sql = `SELECT cat.name AS category, SUM(ol.quantity) AS sales
    FROM orderinfo o
    JOIN orderline ol ON o.id = ol.order_id
    JOIN products p ON ol.product_id = p.id
    JOIN categories cat ON p.category_id = cat.id
    WHERE o.status = 'success'
    GROUP BY cat.name`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};

// Line Chart: Orders Over Time (count of successful orders per month)
exports.ordersOverTime = (req, res) => {
  const sql = `SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, COUNT(*) AS orders
    FROM orderinfo o
    WHERE o.status = 'success'
    GROUP BY month
    ORDER BY month`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};

// Pie Chart: User Roles (count of users by role)
exports.userRoles = (req, res) => {
  const sql = `SELECT role, COUNT(*) AS count FROM users GROUP BY role`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};

// Yearly Sales
exports.yearlySales = (req, res) => {
  const sql = `SELECT YEAR(order_date) AS year, SUM(total) AS sales
    FROM orderinfo
    WHERE status = 'success'
    GROUP BY year
    ORDER BY year`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};

// Monthly Sales
exports.monthlySales = (req, res) => {
  const sql = `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total) AS sales
    FROM orderinfo
    WHERE status = 'success'
    GROUP BY month
    ORDER BY month`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};

// Sales Bar Chart by Date Range
exports.salesBarByDateRange = (req, res) => {
  const { start, end } = req.query;
  const sql = `SELECT order_date, total FROM orderinfo WHERE status = 'success' AND order_date BETWEEN ? AND ? ORDER BY order_date`;
  connection.execute(sql, [start, end], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};

// Pie Chart: Sales by Product (percentage of total sales)
exports.salesPieByProduct = (req, res) => {
  const sql = `SELECT p.name AS product, SUM(ol.quantity * ol.price) AS sales
    FROM orderinfo o
    JOIN orderline ol ON o.id = ol.order_id
    JOIN products p ON ol.product_id = p.id
    WHERE o.status = 'success'
    GROUP BY p.id, p.name`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};

// Daily Sales (Line Chart)
exports.dailySalesLine = (req, res) => {
  const sql = `SELECT DATE(order_date) AS day, SUM(total) AS sales
    FROM orderinfo
    WHERE status = 'success'
    GROUP BY day
    ORDER BY day`;
  connection.execute(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ data: results });
  });
};