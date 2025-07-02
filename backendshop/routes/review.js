const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Add a review (user)
router.post('/', isAuthenticatedUser, reviewController.addReview);
// Get reviews for a product (public)
router.get('/', reviewController.getProductReviews);
// Admin: List all reviews
router.get('/moderate', isAuthenticatedUser, isAdmin, reviewController.listAllReviews);
// Admin: Delete a review
router.delete('/:id', isAuthenticatedUser, isAdmin, reviewController.deleteReview);
// User: Get their own review for a product
router.get('/my', isAuthenticatedUser, reviewController.getMyReview);
// User: Update their own review for a product
router.put('/:product_id', isAuthenticatedUser, reviewController.updateMyReview);
// User: Delete their own review for a product
router.delete('/my/:product_id', isAuthenticatedUser, reviewController.deleteMyReview);

module.exports = router; 