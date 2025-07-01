const express = require('express');

const router = express.Router();

const {createOrder, getOrders} = require('../controllers/order')
const {isAuthenticatedUser} = require('../middlewares/auth')

router.post('/create-order', isAuthenticatedUser, createOrder)
router.post('/orders', isAuthenticatedUser, createOrder)
router.get('/orders', isAuthenticatedUser, getOrders)

module.exports = router;