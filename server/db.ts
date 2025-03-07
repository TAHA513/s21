
import pg from 'pg';

// إنشاء تجمع الاتصالات لقاعدة البيانات بوستجريسكل
export const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
  ssl: false
});

// اختبار الاتصال بقاعدة البيانات
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
}

// إغلاق الاتصال عند إيقاف التطبيق
process.on('SIGINT', () => {
  pool.end();
  console.log('تم إغلاق اتصال قاعدة البيانات');
  process.exit(0);
});
