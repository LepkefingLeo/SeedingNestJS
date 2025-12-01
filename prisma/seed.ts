import { PrismaClient } from '../generated/prisma/client'
import { faker } from '@faker-js/faker'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
async function main() {
  await prisma.$transaction(async tx => {
    const userIds: number[] = [];
    const adminUser = await tx.user.create({
      data: {
        email: 'admin@example.com',
        // Password: admin_password
        password: '$argon2i$v=19$m=16,t=2,p=1$WTg2QzhmVUlsbjFFSzA0Wg$HkM69ytbYBA5BdwlHmJoxA',
        profilepic: 'https://picsum.photos/id/237/200/300'
      }
    })
    userIds.push(adminUser.id)
    for (let i = 0; i < 10; i++) {
      const user = await tx.user.create({
        data: {
          email: `user${i}@example.com`,
          // Password: password1234
          password: '$argon2i$v=19$m=16,t=2,p=1$MTFZVUNpZWlGNHFUTXVVTQ$lWg2AuuTd1nIJTUvKjlW+w',
          profilepic: `https://picsum.photos/id/${i + 100}/200/300`
        }
      })
      userIds.push(user.id)
    }
    for (let i = 0; i < 20; i++) {
      await tx.product.create({
        data: {
          name: faker.food.ingredient(),
          price: faker.commerce.price({
            min: 0.5,
            max: 200
          }),
          bestBefore: faker.datatype.boolean(0.2) ? null : faker.date.soon(),
          whishlistedBy: {
            connect: faker.helpers.arrayElements(userIds).map(id => ({ id }))
          }
        }
      })
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
