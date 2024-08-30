const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const BookController = require('../controllers/Book-controller');

router.get('/payment', authenticate,BookController.getPayment)
router.post('/add', authenticate,BookController.createPayment)
router.patch('/complete', authenticate,BookController.finishPayment)
router.post('/dismiss', authenticate,BookController.cancelPayment)
router.get('/history', authenticate,BookController.getPaymentHistoryForAdmin)
router.put('/statuscancel/:id',authenticate,BookController.updatePaymentStatuscancel)
router.put('/statusdelivery/:id',authenticate,BookController.updatePaymentStatus)

module.exports = router;