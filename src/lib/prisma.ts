import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma";
import { URL } from "url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const originalUrl = process.env.DATABASE_URL;

  // Use a sensible default if env is missing (shouldn't happen in valid setup)
  if (!originalUrl) {
    throw new Error("DATABASE_URL is not defined");
  }

  // Parse URL to safely manipulate params
  // We need to remove sslmode=require because it forces full verification
  // which fails with Supabase's self-signed certs in this environment.
  // We'll control SSL via the adapter config instead.
  const parsedUrl = new URL(originalUrl);
  parsedUrl.searchParams.delete("sslmode");
  const connectionString = parsedUrl.toString();

  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
