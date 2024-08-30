const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const authController = require('../controllers/auth-controller')

router.post('/register', authController.register)
router.post('/registerdelivery', authController.registerdelivery)
router.post('/login', authController.login)
router.get('/me', authenticate, authController.getme)
router.post('/Profile',authenticate,authController.createProfileUser)
router.get('/Profile', authenticate, authController.getProfileByUser)
router.put('/Profile/:id', authenticate, authController.updateProfileUser)
router.get('/users', authenticate, authController.getAllUsers)
router.put('/users/:id', authenticate, authController.updateUserRole)

module.exports = router