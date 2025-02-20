import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { users } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createInitialUser() {
  const hashedPassword = await hashPassword("Tahabootch");
  
  await db.insert(users).values({
    username: "BC512",
    password: hashedPassword,
    name: "Admin",
    role: "admin"
  });
  
  console.log("Initial user created successfully");
}

createInitialUser().catch(console.error);
