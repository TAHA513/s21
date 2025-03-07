import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

neonConfig.webSocketConstructor = ws;

// التحقق من وجود رابط قاعدة البيانات في متغيرات البيئة
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in environment variables');
}

// إنشاء مجمع الاتصالات
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// إنشاء مثيل قاعدة البيانات مع Drizzle
export const db = drizzle(pool, { schema });

// إضافة وظيفة للتحقق من الاتصال
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
    return true;
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    return false;
  }
}
