const prisma = require('./src/config/db').default;

async function testDbSpeed() {
  console.log('Testing database speed...');
  console.time('total-test');
  
  // First, get a known user ID (we'll use the first user)
  console.time('find-first-user');
  const firstUser = await prisma.user.findFirst({ select: { id: true, username: true } });
  console.timeEnd('find-first-user');
  
  if (!firstUser) {
    console.error('No users found in database!');
    await prisma.$disconnect();
    process.exit(1);
  }
  
  console.log('Using user ID:', firstUser.id, 'Username:', firstUser.username);
  
  // Test 1: findUnique by ID with minimal select
  console.time('findUnique-id-minimal');
  const user1 = await prisma.user.findUnique({
    where: { id: firstUser.id },
    select: { id: true }
  });
  console.timeEnd('findUnique-id-minimal');
  console.log('Result:', !!user1);
  
  // Test 2: findUnique by username (with includes)
  console.time('findUnique-username-full');
  const user2 = await prisma.user.findUnique({
    where: { id: firstUser.id },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      role: true,
      bio: true,
      categoryId: true,
      skillTitle: true,
      expertiseTags: true,
      serviceIds: true,
      createdAt: true,
      updatedAt: true,
      category: true,
      posts: { orderBy: { createdAt: 'desc' }, take: 10 },
      receivedReviews: { include: { reviewer: true }, take: 10 }
    }
  });
  console.timeEnd('findUnique-username-full');
  console.log('Result:', !!user2);
  
  console.timeEnd('total-test');
  
  await prisma.$disconnect();
  console.log('Test completed!');
}

testDbSpeed().catch((e) => {
  console.error(e);
  process.exit(1);
});
