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

// إضافة وظيفة للتحقق من الاتصال
export async function testConnection() {
  try {
    console.log('جاري اختبار الاتصال بقاعدة البيانات...');
    const result = await pool.query('SELECT NOW()');
    console.log('تم الاتصال بقاعدة البيانات بنجاح. الوقت الحالي:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
}

// إغلاق الاتصال عند إيقاف التطبيق
process.on('SIGINT', () => {
  pool.end();
  console.log('تم إغلاق اتصال قاعدة البيانات');
  process.exit(0);
});