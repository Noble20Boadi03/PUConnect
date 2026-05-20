import { PrismaClient } from '@prisma/client';

// Instantiate the Prisma Client to interact with Supabase PostgreSQL
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
