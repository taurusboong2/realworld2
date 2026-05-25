import { db } from './index';

async function main() {
  console.log('Seeding dummy data...');

  await db.user.deleteMany();

  const user1 = await db.user.create({
    data: {
      email: 'test1@example.com',
      username: 'tester1',
      password: 'password123',
      bio: 'I am the first tester',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tester1',
    },
  });

  const user2 = await db.user.create({
    data: {
      email: 'test2@example.com',
      username: 'tester2',
      password: 'password456',
      bio: 'Hello from tester 2',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tester2',
    },
  });

  console.log({ user1, user2 });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
