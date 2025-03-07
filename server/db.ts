
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// إعداد Neon للاتصال بقاعدة البيانات
neonConfig.webSocketConstructor = ws;

// استخراج عنوان قاعدة البيانات من متغيرات البيئة
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL غير محدد. هل نسيت إضافته في ملف .env؟",
  );
}

// إنشاء اتصال بقاعدة البيانات
const pool = new Pool({ connectionString: databaseUrl });

// إنشاء عميل درزل
export const db = drizzle(pool, { schema });

// وظيفة اختبار الاتصال بقاعدة البيانات
export async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    return result.rows[0];
  } catch (error) {
    console.error('فشل اختبار الاتصال بقاعدة البيانات:', error);
    throw error;
  }
}
