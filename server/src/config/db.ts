import { PrismaClient } from '@prisma/client';

// Instantiate the Prisma Client to interact with Supabase PostgreSQL
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
