import { prisma } from '../clients/prisma.client';

async function main() {
  const user = await prisma.user.create({
    data: {
      username: 'Alice',
      password: '1234',
      email: 'alice@prisma.io',
    },
  });
  console.log('Created user:', user);

  const allUsers = await prisma.user.findMany();
  console.log('All users:', JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
