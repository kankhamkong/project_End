const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const BookController = require('../controllers/Book-controller')

router.get('/', authenticate, BookController.getByUser)
router.get('/all-status', authenticate, BookController.getAllStatus)
router.get('/book-options/:id', authenticate, BookController.getBookOptions)
router.post('/add', authenticate, BookController.addBook)
router.put('/:id', authenticate, BookController.updateTodo)
router.delete('/:id', authenticate, BookController.deleteTodo )
router.get('/book' , BookController.getBook)
router.get('/:id',authenticate, BookController.getByid)
router.delete('/book/:id', authenticate, BookController.deleteBook )



module.exports = router