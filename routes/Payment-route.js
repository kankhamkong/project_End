const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const BookController = require('../controllers/Book-controller');

router.get('/payment', authenticate,BookController.getPayment)
router.post('/add', authenticate,BookController.createPayment)
router.patch('/complete', authenticate,BookController.finishPayment)
router.post('/cancel', authenticate,BookController.cancelPayment)
router.get('/history', authenticate,BookController.getPaymentHistoryForAdmin)

module.exports = router;