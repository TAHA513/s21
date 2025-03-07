import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// تحسين إعدادات التجمع للحصول على اتصال أكثر استقرارًا
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // الحد الأقصى لعدد الاتصالات
  idleTimeoutMillis: 60000, // زيادة وقت انتهاء مهلة الخمول
  connectionTimeoutMillis: 10000, // زيادة وقت انتهاء مهلة الاتصال
  allowExitOnIdle: false, // منع الخروج عند الخمول
  keepAlive: true, // الحفاظ على الاتصال نشطًا
});

// تحسين معالجة أخطاء الاتصال
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  if (err.code === '57P01') {
    console.log('Connection terminated, attempting to reconnect...');
    // Drizzle will handle reconnection automatically
  } else {
    console.error('Critical database error:', err);
  }
});

// تهيئة Drizzle ORM مع pool
export const db = drizzle(pool, { schema });

// تصدير pool للاستخدام في أجزاء أخرى من التطبيق إذا لزم الأمر
export { pool as dbPool };