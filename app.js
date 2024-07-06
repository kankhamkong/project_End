require('dotenv').config()
const express = require('express')
const cors = require('cors')
// // const notFound = require('./middlewares/notFound')
// // const errorMiddleware = require('./middlewares/error')
const authRoute = require('./routes/auth-route')
const bookRoute = require('./routes/Book-route')
const cartRoute = require('./routes/Cart-route')
const orderRoute = require('./routes/Order-route')
const paymentRoute = require('./routes/Payment-route')

const app = express()

app.use(cors())
app.use(express.json())

// // service
app.use('/auth', authRoute)
app.use('/book',bookRoute )
app.use('/cart', cartRoute)
app.use('/order',orderRoute)
app.use('/payment',paymentRoute)



// notFound
// app.use( notFound )

// error
// app.use(errorMiddleware)

let port = process.env.PORT || 8000
app.listen(port, ()=> console.log('Server on Port :', port))