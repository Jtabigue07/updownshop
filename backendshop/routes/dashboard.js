const express = require('express');

const router = express.Router();

const {addressChart, salesChart, itemsChart, salesByCategory, ordersOverTime, userRoles, yearlySales, monthlySales, salesBarByDateRange, salesPieByProduct, dailySalesLine} = require('../controllers/dashboard')
const {isAuthenticatedUser} = require('../middlewares/auth')
const {isAdmin} = require('../middlewares/role')

router.get('/address-chart', isAuthenticatedUser, isAdmin, addressChart)
router.get('/sales-chart', isAuthenticatedUser, isAdmin, salesChart)
router.get('/items-chart', isAuthenticatedUser, isAdmin, itemsChart)

// Analytics endpoints for admin dashboard charts
router.get('/analytics/sales-by-category', isAuthenticatedUser, isAdmin, salesByCategory)
router.get('/analytics/orders-over-time', isAuthenticatedUser, isAdmin, ordersOverTime)
router.get('/analytics/user-roles', isAuthenticatedUser, isAdmin, userRoles)
router.get('/analytics/yearly-sales', isAuthenticatedUser, isAdmin, yearlySales)
router.get('/analytics/monthly-sales', isAuthenticatedUser, isAdmin, monthlySales)
router.get('/analytics/sales-bar', isAuthenticatedUser, isAdmin, salesBarByDateRange)
router.get('/analytics/sales-pie', isAuthenticatedUser, isAdmin, salesPieByProduct)
router.get('/analytics/daily-sales-line', isAuthenticatedUser, isAdmin, dailySalesLine)

module.exports = router;




