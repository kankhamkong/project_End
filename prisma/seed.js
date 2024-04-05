const bcrypt = require('bcryptjs')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()


const subscriptionsData = [
 {start: new Date(), end: new Date(), userId:1, bookId:1}
  
]

const run = async () => {
  await prisma.subscription.createMany({
    data : subscriptionsData
  })
  // await prisma.todo.createMany({
  //   data : todoData
  // })
}

run()
