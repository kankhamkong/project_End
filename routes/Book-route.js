const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const BookController = require('../controllers/Book-controller')

router.get('/', authenticate, BookController.getByUser)
router.get('/book-options/:id', authenticate, BookController.getBookOptions)
router.post('/add', authenticate, BookController.addBook)
router.put('/:id', authenticate, BookController.updateBook)
router.get('/book' , BookController.getBook)
router.get('/:id',authenticate, BookController.getByid)
router.delete('/book/:id', authenticate, BookController.deleteBook )



module.exports = router