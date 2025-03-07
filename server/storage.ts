import { pool } from './db.js';

// فئة التخزين للتعامل مع عمليات قاعدة البيانات
class Storage {
  // إنشاء جداول قاعدة البيانات إذا لم تكن موجودة
  async ensureTablesExist() {
    try {
      console.log("🔍 جاري التحقق من وجود الجداول...");

      // إنشاء جدول المنتجات
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          barcode VARCHAR(255),
          description TEXT,
          cost_price DECIMAL(10, 2) NOT NULL,
          selling_price DECIMAL(10, 2) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          group_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // إنشاء جدول فئات المنتجات
      await pool.query(`
        CREATE TABLE IF NOT EXISTS product_groups (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // إنشاء جدول العملاء
      await pool.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(255),
          address TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // إنشاء جدول الفواتير
      await pool.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER,
          customer_name VARCHAR(255),
          subtotal DECIMAL(10, 2) NOT NULL,
          discount DECIMAL(5, 2) DEFAULT 0,
          discount_amount DECIMAL(10, 2) DEFAULT 0,
          final_total DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // إنشاء جدول عناصر الفاتورة
      await pool.query(`
        CREATE TABLE IF NOT EXISTS invoice_items (
          id SERIAL PRIMARY KEY,
          invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
          product_id INTEGER,
          product_name VARCHAR(255) NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10, 2) NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log("✅ تم التحقق من وجود الجداول بنجاح");

      // التحقق من وجود بيانات وإضافة بيانات تجريبية إذا لزم الأمر
      await this.ensureDummyDataExists();

      return true;
    } catch (error) {
      console.error("❌ خطأ في إنشاء الجداول:", error);
      return false;
    }
  }

  // التأكد من وجود بيانات تجريبية
  async ensureDummyDataExists() {
    try {
      // إضافة فئات المنتجات التجريبية إذا لم تكن موجودة
      const groupsResult = await pool.query('SELECT COUNT(*) FROM product_groups');
      if (parseInt(groupsResult.rows[0].count) === 0) {
        console.log("🔄 إضافة فئات منتجات تجريبية...");

        await pool.query(`
          INSERT INTO product_groups (name, description) VALUES 
          ('الكترونيات', 'أجهزة الكترونية وكهربائية'),
          ('ملابس', 'ملابس متنوعة للرجال والنساء والأطفال'),
          ('أثاث', 'أثاث منزلي ومكتبي')
        `);
      }

      // إضافة منتجات تجريبية إذا لم تكن موجودة
      const productsResult = await pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(productsResult.rows[0].count) === 0) {
        console.log("🔄 إضافة منتجات تجريبية...");

        // الحصول على معرف فئة الالكترونيات
        const groupResult = await pool.query("SELECT id FROM product_groups WHERE name = 'الكترونيات'");
        const electronicsGroupId = groupResult.rows.length > 0 ? groupResult.rows[0].id : null;

        await pool.query(`
          INSERT INTO products (name, barcode, description, cost_price, selling_price, quantity, group_id) VALUES 
          ('هاتف ذكي', '123456789', 'هاتف ذكي حديث', 1500, 1800, 10, $1),
          ('لابتوب', '987654321', 'لابتوب للألعاب', 3500, 4200, 5, $1),
          ('سماعات بلوتوث', '456789123', 'سماعات لاسلكية عالية الجودة', 150, 200, 20, $1),
          ('شاشة كمبيوتر', '789123456', 'شاشة كمبيوتر 24 بوصة', 500, 650, 8, $1),
          ('لوحة مفاتيح', '321654987', 'لوحة مفاتيح ميكانيكية للألعاب', 200, 280, 15, $1)
        `, [electronicsGroupId]);
      }

      // إضافة عملاء تجريبيين إذا لم يكونوا موجودين
      const customersResult = await pool.query('SELECT COUNT(*) FROM customers');
      if (parseInt(customersResult.rows[0].count) === 0) {
        console.log("🔄 إضافة عملاء تجريبيين...");

        await pool.query(`
          INSERT INTO customers (name, phone, email, address, notes) VALUES 
          ('أحمد محمد', '0555123456', 'ahmed@example.com', 'الرياض، حي النخيل', 'عميل منتظم'),
          ('فاطمة علي', '0505987654', 'fatima@example.com', 'جدة، حي الروضة', 'عميلة جديدة'),
          ('خالد عبدالله', '0565432198', 'khaled@example.com', 'الدمام، حي الشاطئ', 'يفضل الدفع نقداً')
        `);
      }

      console.log("✅ تم التحقق من البيانات التجريبية بنجاح");
    } catch (error) {
      console.error("❌ خطأ في إضافة البيانات التجريبية:", error);
    }
  }

  // ======= عمليات المنتجات =======

  // الحصول على جميع المنتجات
  async getAllProducts() {
    try {
      console.log("🔍 جاري جلب جميع المنتجات...");

      const query = `
        SELECT p.*, g.name as group_name 
        FROM products p 
        LEFT JOIN product_groups g ON p.group_id = g.id
        ORDER BY p.id
      `;

      const result = await pool.query(query);
      console.log(`✅ تم جلب ${result.rows.length} منتج بنجاح`);

      return result.rows;
    } catch (error) {
      console.error("❌ خطأ في جلب المنتجات:", error);
      return [];
    }
  }

  // الحصول على منتج بواسطة المعرف
  async getProductById(id) {
    try {
      const query = `
        SELECT p.*, g.name as group_name 
        FROM products p 
        LEFT JOIN product_groups g ON p.group_id = g.id
        WHERE p.id = $1
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ خطأ في جلب المنتج:", error);
      return null;
    }
  }

  // إضافة منتج جديد
  async addProduct(productData) {
    try {
      const { name, barcode, description, cost_price, selling_price, quantity, group_id } = productData;

      const query = `
        INSERT INTO products (name, barcode, description, cost_price, selling_price, quantity, group_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `;

      const result = await pool.query(query, [
        name, 
        barcode || null, 
        description || null, 
        cost_price, 
        selling_price, 
        quantity || 0, 
        group_id || null
      ]);

      console.log(`✅ تم إضافة المنتج "${name}" بنجاح`);
      return result.rows[0];
    } catch (error) {
      console.error("❌ خطأ في إضافة المنتج:", error);
      return null;
    }
  }

  // تحديث منتج
  async updateProduct(id, productData) {
    try {
      const { name, barcode, description, cost_price, selling_price, quantity, group_id } = productData;

      const query = `
        UPDATE products 
        SET name = $1, barcode = $2, description = $3, cost_price = $4, 
            selling_price = $5, quantity = $6, group_id = $7 
        WHERE id = $8 
        RETURNING *
      `;

      const result = await pool.query(query, [
        name, 
        barcode || null, 
        description || null, 
        cost_price, 
        selling_price, 
        quantity || 0, 
        group_id || null, 
        id
      ]);

      console.log(`✅ تم تحديث المنتج رقم ${id} بنجاح`);
      return result.rows[0];
    } catch (error) {
      console.error("❌ خطأ في تحديث المنتج:", error);
      return null;
    }
  }

  // حذف منتج
  async deleteProduct(id) {
    try {
      const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length > 0) {
        console.log(`✅ تم حذف المنتج رقم ${id} بنجاح`);
        return true;
      } else {
        console.log(`⚠️ لم يتم العثور على المنتج رقم ${id}`);
        return false;
      }
    } catch (error) {
      console.error("❌ خطأ في حذف المنتج:", error);
      return false;
    }
  }

  // ======= عمليات فئات المنتجات =======

  // الحصول على جميع فئات المنتجات
  async getAllCategories() {
    try {
      console.log("🔍 جاري جلب جميع فئات المنتجات...");

      const query = 'SELECT * FROM product_groups ORDER BY id';
      const result = await pool.query(query);

      console.log(`✅ تم جلب ${result.rows.length} فئة بنجاح`);
      return result.rows;
    } catch (error) {
      console.error("❌ خطأ في جلب فئات المنتجات:", error);
      return [];
    }
  }

  // ======= عمليات العملاء =======

  // الحصول على جميع العملاء
  async getAllCustomers() {
    try {
      console.log("🔍 جاري جلب جميع العملاء...");

      const query = 'SELECT * FROM customers ORDER BY id';
      const result = await pool.query(query);

      console.log(`✅ تم جلب ${result.rows.length} عميل بنجاح`);
      return result.rows;
    } catch (error) {
      console.error("❌ خطأ في جلب العملاء:", error);
      return [];
    }
  }

  // إضافة عميل جديد
  async addCustomer(customerData) {
    try {
      const { name, phone, email, address, notes } = customerData;

      const query = `
        INSERT INTO customers (name, phone, email, address, notes) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `;

      const result = await pool.query(query, [
        name, 
        phone || null, 
        email || null, 
        address || null, 
        notes || null
      ]);

      console.log(`✅ تم إضافة العميل "${name}" بنجاح`);
      return result.rows[0];
    } catch (error) {
      console.error("❌ خطأ في إضافة العميل:", error);
      return null;
    }
  }

  // ======= عمليات الفواتير =======

  // الحصول على جميع الفواتير
  async getAllInvoices() {
    try {
      console.log("🔍 جاري جلب جميع الفواتير...");

      const query = 'SELECT * FROM invoices ORDER BY created_at DESC';
      const result = await pool.query(query);

      console.log(`✅ تم جلب ${result.rows.length} فاتورة بنجاح`);
      return result.rows;
    } catch (error) {
      console.error("❌ خطأ في جلب الفواتير:", error);
      return [];
    }
  }

  // إنشاء فاتورة جديدة
  async createInvoice(invoiceData, invoiceItems) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { customer_id, customer_name, subtotal, discount, discount_amount, final_total, status } = invoiceData;

      // إنشاء الفاتورة
      const invoiceQuery = `
        INSERT INTO invoices (customer_id, customer_name, subtotal, discount, discount_amount, final_total, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `;

      const invoiceResult = await client.query(invoiceQuery, [
        customer_id || null, 
        customer_name, 
        subtotal, 
        discount || 0, 
        discount_amount || 0, 
        final_total, 
        status || 'pending'
      ]);

      const invoice = invoiceResult.rows[0];

      // إضافة عناصر الفاتورة
      for (const item of invoiceItems) {
        const { product_id, product_name, quantity, unit_price, total_price } = item;

        const itemQuery = `
          INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(itemQuery, [
          invoice.id, 
          product_id, 
          product_name, 
          quantity, 
          unit_price, 
          total_price
        ]);

        // تحديث كمية المنتج في المخزون
        if (product_id) {
          await client.query(
            'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
            [quantity, product_id]
          );
        }
      }

      await client.query('COMMIT');

      console.log(`✅ تم إنشاء الفاتورة رقم ${invoice.id} بنجاح`);
      return invoice;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("❌ خطأ في إنشاء الفاتورة:", error);
      return null;
    } finally {
      client.release();
    }
  }


  // User operations - These remain largely unchanged but could be improved for error handling and logging consistency.
  async getUsers() {
    try {
      console.log("جاري استرجاع المستخدمين من قاعدة البيانات...");
      const result = await pool.query('SELECT * FROM users');
      console.log(`تم استرجاع ${result.rows.length} مستخدم من قاعدة البيانات`);
      return result.rows;
    } catch (error) {
      console.error("خطأ في استرجاع المستخدمين من قاعدة البيانات:", error);
      return [];
    }
  }

  async getUserByUsername(username: string) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في استرجاع المستخدم من قاعدة البيانات:", error);
      return null;
    }
  }

  async createUser(user: any) {
    try {
      const { username, name, email, phone, password } = user;
      const result = await pool.query(
        'INSERT INTO users (username, name, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, name, email, phone, password]
      );
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في إنشاء المستخدم:", error);
      throw error;
    }
  }

  //Methods below this line are removed as they are redundant with the new structure.
  // async getProducts() { ... }
  // async getProduct(id: number) { ... }
  // async createProduct(product: any) { ... }
  // async updateProduct(id: number, product: any) { ... }
  // async deleteProduct(id: number) { ... }
  // async getCustomers() { ... }
  // async getCustomer(id: number) { ... }
  // async createCustomer(customer: any) { ... }
  // async getInvoices() { ... }
  // async getInvoice(id: number) { ... }
  // async createInvoice(invoice: any) { ... }
  // async getCategories() { ... }
  // private async addDummyProducts() { ... }
  // private async addDummyCategories() { ... }
  // private async addDummyCustomers() { ... }
  // private async addDummyInvoices() { ... }
  //Removed redundant methods


}

// إنشاء نسخة مفردة من فئة التخزين
export const storage = new Storage();