const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const {registerUser, loginUser, updateUser, deactivateUser, getUserProfile, getAllUsers, updateUserRole, updateUserStatus} = require('../controllers/user')
const {isAuthenticatedUser} = require('../middlewares/auth')
const {isAdmin} = require('../middlewares/role')

// Register a new user (add 'role' to request body for admin)
// Example: { "name": "admin", "email": "admin@email.com", "password": "pass", "role": "admin" }

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/update-profile', isAuthenticatedUser, upload.single('image'), updateUser)
router.delete('/deactivate', isAuthenticatedUser, deactivateUser)
router.get('/profile/:userId', isAuthenticatedUser, getUserProfile)
router.get('/users/all', isAuthenticatedUser, isAdmin, getAllUsers)
router.put('/users/:id/role', isAuthenticatedUser, isAdmin, updateUserRole)
router.put('/users/:id/status', isAuthenticatedUser, isAdmin, updateUserStatus)

module.exports = router;