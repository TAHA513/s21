import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// الحصول على معلومات الاتصال من متغيرات البيئة
// هذا يسمح بتكوين قاعدة البيانات من خلال متغيرات البيئة في السحابة المضيفة
const getDatabaseConfig = () => {
  // استخدام DATABASE_URL إذا كان متاحًا (معظم السحابات توفر هذا)
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  // وإلا، استخدم قيم منفصلة إذا تم توفيرها
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};

// إنشاء مجمع اتصالات قاعدة البيانات مع إعدادات التكوين
export const pool = new Pool({
  ...getDatabaseConfig(),
  max: parseInt(process.env.DB_POOL_MAX || '20'), // عدد الاتصالات المتزامنة القصوى
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // مهلة الخمول
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // مهلة الاتصال
});

// إضافة مستمعي أحداث لمجمع الاتصالات لتتبع المشاكل
pool.on('error', (err) => {
  console.error('خطأ غير متوقع في مجمع اتصالات قاعدة البيانات:', err);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('تم إنشاء اتصال جديد بقاعدة البيانات');
  }
});

// تصدير كائن Drizzle ORM
export const db = drizzle(pool);

// اختبار الاتصال بقاعدة البيانات
export async function testConnection() {
  try {
    // فحص إذا كنا في بيئة إنتاج وكانت DATABASE_URL غير موجودة
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      console.warn("⚠️ نظام يعمل في وضع تجاوز قاعدة البيانات (وضع تجريبي)");
      return true; // لتجنب توقف التطبيق في بيئة الإنتاج إذا لم تكن قاعدة البيانات متوفرة
    }

    await db.execute(sql`SELECT 1`);
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
    return true;
  } catch (error) {
    console.error("⚠️ تعذر الاتصال بقاعدة البيانات:", error);
    // تسجيل الخطأ ولكن السماح للتطبيق بالاستمرار في وضع الإنتاج
    if (process.env.NODE_ENV === 'production') {
      console.warn("⚠️ التطبيق يعمل في وضع محدود بدون قاعدة بيانات");
      return true;
    }
    return false;
  }
}