const express = require('express');

const router = express.Router();

const {createOrder, getOrders, getAllOrders, updateOrderStatus, getOrderLines} = require('../controllers/order')
const {isAuthenticatedUser} = require('../middlewares/auth')

router.post('/create-order', isAuthenticatedUser, createOrder)
router.post('/orders', isAuthenticatedUser, createOrder)
router.get('/orders', isAuthenticatedUser, getOrders)
router.get('/admin/orders', isAuthenticatedUser, getAllOrders)
router.patch('/admin/orders/:orderId/status', isAuthenticatedUser, updateOrderStatus)
router.get('/orderlines', isAuthenticatedUser, getOrderLines)

module.exports = router;