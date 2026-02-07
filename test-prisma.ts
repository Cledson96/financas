import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma/generated/prisma/client.js";
import { URL } from "url";

async function main() {
  const originalUrl = process.env.DATABASE_URL!;
  console.log("Original URL:", originalUrl.substring(0, 50) + "...");

  // Parse URL to safely manipulate params
  const parsedUrl = new URL(originalUrl);

  // Remove sslmode param
  parsedUrl.searchParams.delete("sslmode");

  const connectionString = parsedUrl.toString();
  console.log("Modified URL:", connectionString.substring(0, 50) + "...");

  console.log("Creating adapter with rejectUnauthorized: false...");
  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Creating PrismaClient...");
  const prisma = new PrismaClient({ adapter });

  console.log("Fetching users...");
  try {
    const users = await prisma.user.findMany();
    console.log("Users found:", users.length);
    console.log("First user:", users[0]);
    console.log("SUCCESS: Connection established!");
  } catch (error) {
    console.error("Error:", error);
  }

  await prisma.$disconnect();
}

main();
