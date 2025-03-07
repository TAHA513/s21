import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// إنشاء الاتصال باستخدام متغيرات البيئة
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('خطأ: متغير البيئة DATABASE_URL غير محدد');
  process.exit(1);
}

// إنشاء مجمع اتصالات قاعدة البيانات
export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// تصدير كائن Drizzle ORM
export const db = drizzle(pool);

// اختبار الاتصال بقاعدة البيانات
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    client.release();
    return true;
  } catch (err) {
    console.error('فشل الاتصال بقاعدة البيانات:', err);
    return false;
  }
}