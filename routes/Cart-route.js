const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const BookController = require('../controllers/Book-controller');

router.post('/cart', authenticate, BookController.addToCart);
router.put('/cart/:id', authenticate, BookController.updateCartItem);  // New route for updating cart items
router.get('/cart', authenticate, BookController.getCartByUser);
router.delete('/cart/:id', authenticate, BookController.removeCartItem);

module.exports = router;
