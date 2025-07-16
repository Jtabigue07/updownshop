const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');
const upload = require('../utils/multer');
const {
  getAllProducts, getProduct, createProduct, updateProduct, deleteProduct, getAllCategories, searchProducts
} = require('../controllers/product');

// Public
router.get('/products', getAllProducts);
router.get('/products/search', searchProducts);
router.get('/products/:id', getProduct);
router.get('/categories', getAllCategories);

// Admin only
router.post('/products', isAuthenticatedUser, isAdmin, upload.single('image'), createProduct);
router.put('/products/:id', isAuthenticatedUser, isAdmin, upload.single('image'), updateProduct);
router.delete('/products/:id', isAuthenticatedUser, isAdmin, deleteProduct);

module.exports = router; 