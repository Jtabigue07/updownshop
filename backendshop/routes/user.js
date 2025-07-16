const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { registerUser, loginUser, updateUser, deactivateUser, getUserProfile, getAllUsers, updateUserRole, updateUserStatus } = require('../controllers/user');
const { authenticateToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/role');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUser);

// Admin routes
router.get('/all', authenticateToken, checkRole(['admin']), getAllUsers);
router.put('/:id/role', authenticateToken, checkRole(['admin']), updateUserRole);
router.put('/:id/status', authenticateToken, checkRole(['admin']), updateUserStatus);
router.delete('/:id', authenticateToken, checkRole(['admin']), deactivateUser);

module.exports = router;