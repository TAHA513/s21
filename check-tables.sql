
-- التحقق من الجداول الموجودة في قاعدة البيانات
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- التحقق من عدد السجلات في كل جدول
SELECT 'customers' as table_name, COUNT(*) as row_count FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_groups', COUNT(*) FROM product_groups
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- المعاينة السريعة للعملاء
SELECT * FROM customers LIMIT 5;

-- المعاينة السريعة للمنتجات
SELECT * FROM products LIMIT 5;

-- المعاينة السريعة للفواتير
SELECT * FROM invoices LIMIT 5;
-- التحقق من وجود الجداول الرئيسية
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- التحقق من عدد السجلات في كل جدول
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'product_groups', COUNT(*) FROM product_groups;
