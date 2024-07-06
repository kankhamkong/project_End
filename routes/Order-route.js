const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const BookController = require('../controllers/Book-controller');

router.post('/order', authenticate, BookController.createOrder); // New route for creating orders
router.get('/order', authenticate, BookController.getOrder);
router.get('/order/history', authenticate, BookController.getOrderHistory);
router.get('/order/detail/:order_id', authenticate, BookController.getOrderDetailHistory);

module.exports = router;