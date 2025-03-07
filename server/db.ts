import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

neonConfig.webSocketConstructor = ws;

// إنشاء مجمع الاتصالات
export const pool = new Pool({ connectionString: process.env.DATABASE_URL || '' });

// إنشاء مثيل قاعدة البيانات مع Drizzle
export const db = drizzle(pool, { schema });

// إضافة وظيفة للتحقق من الاتصال
export async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      return true; // Skip database check if no URL provided
    }
    const result = await pool.query('SELECT NOW()');
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
    return true;
  } catch (error) {
    console.log('جاري العمل بدون قاعدة بيانات');
    return true; // Continue without database
  }
}