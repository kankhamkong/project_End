const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const BookController = require('../controllers/Book-controller')

router.get('/address',authenticate, BookController.getAddressesByUser)
router.post('/address', authenticate, BookController.createAddress)
router.put('/address/:id', authenticate, BookController.updateAddress)



module.exports = router;