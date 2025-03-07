
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema";

// التحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL غير موجود. تأكد من إعداد متغيرات البيئة بشكل صحيح."
  );
}

// إنشاء اتصال قاعدة البيانات
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// دالة لاختبار الاتصال بقاعدة البيانات
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // اختبار الاتصال من خلال استعلام بسيط
    await pool.query('SELECT NOW()');
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
}
