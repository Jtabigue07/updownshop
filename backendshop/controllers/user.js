const connection = require('../config/database');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const registerUser = async (req, res) => {
    // {
    //   "name": "steve",
    //   "email": "steve@gmail.com",
    //   "password": "password"
    // }
    const { name, password, email, role } = req.body;
    const userRole = role && (role === 'admin') ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userSql = 'INSERT INTO users (name, password, email, role) VALUES (?, ?, ?, ?)';
    try {
        connection.execute(userSql, [name, hashedPassword, email, userRole], (err, result) => {
            if (err instanceof Error) {
                console.log(err);

                return res.status(401).json({
                    error: err
                });
            }

            return res.status(200).json({
                success: true,
                result
            })
        });
    } catch (error) {
        console.log(error)
    }

};

const loginUser = async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    const sql = 'SELECT id, name, email, password, role FROM users WHERE email = ? AND deleted_at IS NULL';
    connection.execute(sql, [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error logging in', details: err });
        }
        console.log(results)
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);
        console.log(match)
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
       
        delete user.password;

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // Save token to DB
        connection.execute('UPDATE users SET token = ? WHERE id = ?', [token, user.id], (err2) => {
            if (err2) {
                console.log(err2);
                return res.status(500).json({ error: 'Error saving token', details: err2 });
            }
        return res.status(200).json({
            success: "welcome back",
                user,
            token
            });
        });
    });
};

const updateUser = (req, res) => {
    // {
    //   "name": "steve",
    //   "email": "steve@gmail.com",
    //   "password": "password"
    // }
    console.log(req.body, req.file)
    const { title, fname, lname, addressline, town, zipcode, phone, userId, } = req.body;

    let image = null;
    if (req.file) {
        image = 'images/' + req.file.filename;
    } else if (req.body.existingImagePath) {
        image = req.body.existingImagePath;
    }
    //     INSERT INTO users(user_id, username, email)
    //   VALUES(1, 'john_doe', 'john@example.com')
    // ON DUPLICATE KEY UPDATE email = 'john@example.com';
    const userSql = `
  INSERT INTO customer 
    (title, fname, lname, addressline, town, zipcode, phone, image_path, user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    fname = VALUES(fname),
    lname = VALUES(lname),
    addressline = VALUES(addressline),
    town = VALUES(town),
    zipcode = VALUES(zipcode),
    phone = VALUES(phone),
    image_path = VALUES(image_path)`;
    const params = [title, fname, lname, addressline, town, zipcode, phone, image, userId];

    try {
        connection.execute(userSql, params, (err, result) => {
            if (err instanceof Error) {
                console.log(err);

                return res.status(401).json({
                    error: err
                });
            }

            // Also update the users table (name only) for admin profile
            const fullName = fname && lname ? fname + ' ' + lname : null;
            if (fullName) {
                const updateUserSql = `UPDATE users SET name = ? WHERE id = ?`;
                connection.execute(updateUserSql, [fullName, userId], (userErr) => {
                    if (userErr) {
                        console.log(userErr);
                        // Don't fail the whole request if this fails
                    }
                    return res.status(200).json({
                        success: true,
                        result
                    });
                });
            } else {
                return res.status(200).json({
                    success: true,
                    result
                });
            }
        });
    } catch (error) {
        console.log(error)
    }

};

const deactivateUser = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const sql = 'UPDATE users SET deleted_at = ? WHERE email = ?';
    const timestamp = new Date();

    connection.execute(sql, [timestamp, email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error deactivating user', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            email,
            deleted_at: timestamp
        });
    });
};

const getUserProfile = (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT c.*, u.email, u.role FROM customer c JOIN users u ON c.user_id = u.id WHERE c.user_id = ?`;
    connection.execute(sql, [userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error fetching profile', details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        return res.status(200).json({ profile: results[0] });
    });
};

const getAllUsers = (req, res) => {
    const sql = `SELECT id, name, email, role, deleted_at FROM users`;
    connection.execute(sql, [], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error fetching users', details: err });
        }
        return res.status(200).json({ users: results });
    });
};

// Update user role
const updateUserRole = (req, res) => {
    const { role } = req.body;
    const { id } = req.params;
    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    const sql = 'UPDATE users SET role = ? WHERE id = ?';
    connection.execute(sql, [role, id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
};

// Update user status (active/inactive)
const updateUserStatus = (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    let sql, params;
    if (status === 'inactive') {
        sql = 'UPDATE users SET deleted_at = ? WHERE id = ?';
        params = [new Date(), id];
    } else if (status === 'active') {
        sql = 'UPDATE users SET deleted_at = NULL WHERE id = ?';
        params = [id];
    } else {
        return res.status(400).json({ error: 'Invalid status' });
    }
    connection.execute(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
};

module.exports = { registerUser, loginUser, updateUser, deactivateUser, getUserProfile, getAllUsers, updateUserRole, updateUserStatus };