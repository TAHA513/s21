
import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { users } from "../shared/schema.js";

// استيراد المتغيرات البيئية
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
const NODE_ENV = process.env.NODE_ENV || "development";

// إنشاء بركة الاتصال بقاعدة البيانات وفقًا للبيئة
const pool = NODE_ENV === "production" ? 
  neon(DATABASE_URL) : 
  new Pool({ connectionString: DATABASE_URL });

// إنشاء معالج Drizzle ORM
const db = drizzle(pool);

export { db };

// تنفيذ وظيفة مفيدة للحصول على مستخدم حسب المعرف
export async function getUserById(id: number) {
  try {
    const result = await db.select().from(users).where({ id }).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// تنفيذ وظيفة مفيدة للحصول على مستخدم حسب البريد الإلكتروني
export async function getUserByEmail(email: string) {
  try {
    const result = await db.select().from(users).where({ email }).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}
