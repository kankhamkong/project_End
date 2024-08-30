const jwt = require('jsonwebtoken');
const db = require('../models/db')
require('dotenv').config()

module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization
    console.log(req.headers.authorization)
    if( !authorization ) {
      throw new Error('Unauthorized')
    }
    if(!(authorization.startsWith('Bearer '))) {
      throw new Error('Unauthorized')
    }
    try {
      const token = authorization.split(' ')[1]
      console.log(token)
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      console.log(payload)
      
      const user = await db.user.findFirstOrThrow({where : {id: payload.id}})
      delete user.password
      // console.log(user)
      req.user = user
      next()
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          // โทเค็นหมดอายุ
          return res.status(400).json({message: 'TokenExpiredError หรือ โทเคนหมดอายุ'})
        } else {
          // ข้อผิดพลาดอื่นๆ
          console.log('Token verification failed:', err.message);
          return res.status(400).json({ message : `Token verification failed : ${err.message}`});
        }
      }
  }catch(err) {
    next(err)
  }

}