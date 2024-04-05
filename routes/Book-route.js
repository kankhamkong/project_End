const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const todoController = require('../controllers/Book-controller')

router.get('/', authenticate, todoController.getByUser)
router.get('/all-status', authenticate, todoController.getAllStatus)
router.post('/add', authenticate, todoController.addBook)
router.put('/:id', authenticate, todoController.updateTodo)
router.delete('/:id', authenticate, todoController.deleteTodo )
router.get('/book' , todoController.getBook)
router.get('/subscriptions',authenticate, todoController.getSubscriptions)
router.get('/:id',authenticate, todoController.getByid)
router.delete('/book/:id', authenticate, todoController.deleteBook )
router.post('/creative', authenticate, todoController.creativeSubscriptions)


module.exports = router