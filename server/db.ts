
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';

// إنشاء الاتصال باستخدام متغيرات البيئة
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('خطأ: متغير البيئة DATABASE_URL غير محدد');
  console.log('سيتم استخدام قاعدة بيانات افتراضية لبيئة التطوير');
  // استخدام قاعدة بيانات تجريبية محلية للتطوير
  // يمكن تغيير هذا في ملف .env
}

// إنشاء مجمع اتصالات قاعدة البيانات مع إعدادات أفضل
export const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // عدد الاتصالات المتزامنة القصوى
  idleTimeoutMillis: 30000, // مهلة الخمول بالمللي ثانية (30 ثانية)
  connectionTimeoutMillis: 5000, // مهلة الاتصال (5 ثوان)
  statement_timeout: 10000, // مهلة تنفيذ الاستعلام (10 ثوان)
  query_timeout: 10000, // مهلة الاستعلام (10 ثوان)
});

// إضافة مستمعي أحداث لمجمع الاتصالات لتتبع المشاكل
pool.on('error', (err) => {
  console.error('خطأ غير متوقع في مجمع اتصالات قاعدة البيانات:', err);
});

pool.on('connect', () => {
  console.log('تم إنشاء اتصال جديد بقاعدة البيانات');
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
