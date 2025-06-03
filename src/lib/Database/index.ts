import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], 
  });
  
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const connectToDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;  
  }
};
