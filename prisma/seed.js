const bcrypt = require('bcryptjs')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const password = bcrypt.hashSync('123456')
const userData = [
  {email: 'andy@mail.com', password, username:'andy', role: 'ADMIN',},
  {email: 'ken@mail.com', password, username:'ken', role: 'User',},

]

const run = async () => {
  await prisma.user.createMany({
    data : userData
  })
}

run()
