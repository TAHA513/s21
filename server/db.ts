import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// استخدام Pool بدلاً من Client للحصول على إدارة أفضل للاتصالات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// التعامل مع أخطاء الاتصال
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// اختبار الاتصال عند بدء التشغيل
pool.connect()
  .then(() => {
    console.log('Successfully connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL database:', err);
    process.exit(-1);
  });

// تهيئة Drizzle ORM مع pool
export const db = drizzle(pool, { schema });

// تصدير pool للاستخدام في أجزاء أخرى من التطبيق إذا لزم الأمر
export { pool as dbPool };