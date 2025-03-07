import { pool } from './db.js';

// فئة التخزين للتعامل مع عمليات قاعدة البيانات
class Storage {

  // إنشاء جداول قاعدة البيانات إذا لم تكن موجودة
  async ensureTablesExist() {
    try {
      console.log("جاري التحقق من وجود الجداول...");

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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // إنشاء جدول المبيعات
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sales (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES customers(id),
          total_amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
          sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // إنشاء جدول تفاصيل المبيعات
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sale_items (
          id SERIAL PRIMARY KEY,
          sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id),
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10, 2) NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL
        )
      `);

      console.log("تم التحقق من وجود الجداول بنجاح");

      // إضافة بعض البيانات التجريبية إذا لم تكن موجودة
      await this.addDummyDataIfEmpty();

      return true;
    } catch (error) {
      console.error("خطأ في إنشاء الجداول:", error);
      return false;
    }
  }

  // إضافة بيانات تجريبية إذا كانت الجداول فارغة
  async addDummyDataIfEmpty() {
    try {
      // التحقق من وجود منتجات
      const productsResult = await pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(productsResult.rows[0].count) === 0) {
        console.log("إضافة منتجات تجريبية...");
        await pool.query(`
          INSERT INTO products (name, barcode, description, cost_price, selling_price, quantity) 
          VALUES 
          ('هاتف ذكي', '123456789', 'هاتف ذكي حديث', 1500, 1800, 10),
          ('لابتوب', '987654321', 'لابتوب للألعاب', 3500, 4200, 5),
          ('سماعات بلوتوث', '456789123', 'سماعات لاسلكية عالية الجودة', 150, 200, 20)
        `);
      }

      // التحقق من وجود عملاء
      const customersResult = await pool.query('SELECT COUNT(*) FROM customers');
      if (parseInt(customersResult.rows[0].count) === 0) {
        console.log("إضافة عملاء تجريبيين...");
        await pool.query(`
          INSERT INTO customers (name, phone, email, address) 
          VALUES 
          ('أحمد محمد', '0555123456', 'ahmed@example.com', 'الرياض، حي النخيل'),
          ('فاطمة علي', '0505987654', 'fatima@example.com', 'جدة، حي الروضة'),
          ('خالد عبدالله', '0565432198', 'khaled@example.com', 'الدمام، حي الشاطئ')
        `);
      }

      console.log("تم التحقق من البيانات التجريبية");
    } catch (error) {
      console.error("خطأ في إضافة البيانات التجريبية:", error);
    }
  }

  // الحصول على جميع المنتجات
  async getAllProducts() {
    try {
      console.log("جاري استرجاع المنتجات من قاعدة البيانات...");
      const result = await pool.query('SELECT * FROM products');
      console.log(`تم استرجاع ${result.rows.length} منتج من قاعدة البيانات`);
      console.log("محتوى المنتجات:", JSON.stringify(result.rows, null, 2));
      return result.rows;
    } catch (error) {
      console.error("خطأ في استرجاع المنتجات من قاعدة البيانات:", error);
      return [];
    }
  }

  // الحصول على منتج بواسطة المعرف
  async getProductById(id) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في استرجاع المنتج من قاعدة البيانات:", error);
      return null;
    }
  }

  // إضافة منتج جديد
  async addProduct(productData) {
    try {
      const { name, barcode, description, cost_price, selling_price, quantity } = productData;
      const result = await pool.query(
        'INSERT INTO products (name, barcode, description, cost_price, selling_price, quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, barcode, description, cost_price, selling_price, quantity]
      );
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في إضافة منتج جديد:", error);
      return null;
    }
  }

  // تحديث منتج
  async updateProduct(id, productData) {
    try {
      const { name, barcode, description, cost_price, selling_price, quantity } = productData;
      const result = await pool.query(
        'UPDATE products SET name = $1, barcode = $2, description = $3, cost_price = $4, selling_price = $5, quantity = $6 WHERE id = $7 RETURNING *',
        [name, barcode, description, cost_price, selling_price, quantity, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      return null;
    }
  }

  // حذف منتج
  async deleteProduct(id) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
      return false;
    }
  }

  // الحصول على جميع العملاء
  async getAllCustomers() {
    try {
      const result = await pool.query('SELECT * FROM customers');
      return result.rows;
    } catch (error) {
      console.error("خطأ في استرجاع العملاء من قاعدة البيانات:", error);
      return [];
    }
  }

  // إضافة عملية بيع جديدة
  async addSale(saleData, saleItems) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { customer_id, total_amount, payment_method } = saleData;

      // إنشاء عملية البيع
      const saleResult = await client.query(
        'INSERT INTO sales (customer_id, total_amount, payment_method) VALUES ($1, $2, $3) RETURNING id',
        [customer_id, total_amount, payment_method]
      );

      const saleId = saleResult.rows[0].id;

      // إضافة عناصر البيع
      for (const item of saleItems) {
        const { product_id, quantity, unit_price, total_price } = item;

        await client.query(
          'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)',
          [saleId, product_id, quantity, unit_price, total_price]
        );

        // تحديث كمية المنتج في المخزون
        await client.query(
          'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
          [quantity, product_id]
        );
      }

      await client.query('COMMIT');
      return { id: saleId, ...saleData };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("خطأ في إضافة عملية البيع:", error);
      return null;
    } finally {
      client.release();
    }
  }
  // User operations
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

  // Product operations
  async getProducts() {
    try {
      console.log("جاري استرجاع المنتجات من قاعدة البيانات...");
      const result = await pool.query('SELECT * FROM products');
      console.log(`تم استرجاع ${result.rows.length} منتج من قاعدة البيانات`);

      // إذا لم تكن هناك منتجات، قم بإضافة منتجات تجريبية
      if (result.rows.length === 0) {
        console.log("لا توجد منتجات في قاعدة البيانات، سيتم إضافة منتجات تجريبية");
        await this.addDummyProducts();
        const newResult = await pool.query('SELECT * FROM products');
        console.log(`تم إضافة وجلب ${newResult.rows.length} منتجات تجريبية`);
        return newResult.rows;
      }

      return result.rows;
    } catch (error) {
      console.error("خطأ في استرجاع المنتجات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getProduct(id: number) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في استرجاع المنتج من قاعدة البيانات:", error);
      return null;
    }
  }

  async createProduct(product: any) {
    try {
      const { name, barcode, description, costPrice, sellingPrice, quantity, groupId } = product;
      const result = await pool.query(
        'INSERT INTO products (name, barcode, description, cost_price, selling_price, quantity, group_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, barcode, description, costPrice, sellingPrice, quantity, groupId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في إنشاء المنتج:", error);
      throw error;
    }
  }

  async updateProduct(id: number, product: any) {
    try {
      const { name, barcode, description, costPrice, sellingPrice, quantity, groupId } = product;
      const result = await pool.query(
        'UPDATE products SET name = $1, barcode = $2, description = $3, cost_price = $4, selling_price = $5, quantity = $6, group_id = $7 WHERE id = $8 RETURNING *',
        [name, barcode, description, costPrice, sellingPrice, quantity, groupId, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      throw error;
    }
  }

  async deleteProduct(id: number) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
      throw error;
    }
  }

  // Customer operations
  async getCustomers() {
    try {
      console.log("جاري استرجاع العملاء من قاعدة البيانات...");
      const result = await pool.query('SELECT * FROM customers');
      console.log(`تم استرجاع ${result.rows.length} عميل من قاعدة البيانات`);

      // إذا لم تكن هناك عملاء، قم بإضافة عملاء تجريبيين
      if (result.rows.length === 0) {
        console.log("لا يوجد عملاء في قاعدة البيانات، سيتم إضافة عملاء تجريبيين");
        await this.addDummyCustomers();
        const newResult = await pool.query('SELECT * FROM customers');
        return newResult.rows;
      }

      return result.rows;
    } catch (error) {
      console.error("خطأ في استرجاع العملاء من قاعدة البيانات:", error);
      return [];
    }
  }

  async getCustomer(id: number) {
    try {
      const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في استرجاع العميل من قاعدة البيانات:", error);
      return null;
    }
  }

  async createCustomer(customer: any) {
    try {
      const { name, phone, email, address, notes } = customer;
      const result = await pool.query(
        'INSERT INTO customers (name, phone, email, address, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, phone, email, address, notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في إنشاء العميل:", error);
      throw error;
    }
  }

  // Invoice operations
  async getInvoices() {
    try {
      console.log("جاري استرجاع الفواتير من قاعدة البيانات...");
      const result = await pool.query('SELECT * FROM invoices');
      console.log(`تم استرجاع ${result.rows.length} فاتورة من قاعدة البيانات`);

      // إذا لم تكن هناك فواتير، قم بإضافة فواتير تجريبية
      if (result.rows.length === 0) {
        console.log("لا توجد فواتير في قاعدة البيانات، سيتم إضافة فواتير تجريبية");
        await this.addDummyInvoices();
        const newResult = await pool.query('SELECT * FROM invoices');
        return newResult.rows;
      }

      return result.rows;
    } catch (error) {
      console.error("خطأ في استرجاع الفواتير من قاعدة البيانات:", error);
      return [];
    }
  }

  async getInvoice(id: number) {
    try {
      const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في استرجاع الفاتورة من قاعدة البيانات:", error);
      return null;
    }
  }

  async createInvoice(invoice: any) {
    try {
      const { customerId, customerName, subtotal, discount, discountAmount, finalTotal, status } = invoice;
      const result = await pool.query(
        'INSERT INTO invoices (customer_id, customer_name, subtotal, discount, discount_amount, final_total, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [customerId, customerName, subtotal, discount, discountAmount, finalTotal, status]
      );
      return result.rows[0];
    } catch (error) {
      console.error("خطأ في إنشاء الفاتورة:", error);
      throw error;
    }
  }

  // Product Group operations (Categories)
  async getCategories() {
    try {
      console.log("جاري استرجاع مجموعات المنتجات من قاعدة البيانات...");
      const result = await pool.query('SELECT * FROM product_groups');
      console.log(`تم استرجاع ${result.rows.length} مجموعة منتجات من قاعدة البيانات`);

      // إذا لم تكن هناك مجموعات، قم بإضافة مجموعات تجريبية
      if (result.rows.length === 0) {
        console.log("لا توجد مجموعات منتجات في قاعدة البيانات، سيتم إضافة مجموعات تجريبية");
        await this.addDummyCategories();
        const newResult = await pool.query('SELECT * FROM product_groups');
        return newResult.rows;
      }

      return result.rows;
    } catch (error) {
      console.error("خطأ في استرجاع مجموعات المنتجات من قاعدة البيانات:", error);
      return [];
    }
  }

  // إضافة بيانات تجريبية
  private async addDummyProducts() {
    try {
      // جلب مجموعات المنتجات
      const categories = await this.getCategories();

      // إذا لم تكن هناك مجموعات، قم بإضافة مجموعة تجريبية
      let categoryId = null;
      if (categories.length > 0) {
        categoryId = categories[0].id;
      }

      // إضافة 5 منتجات تجريبية
      const products = [
        { name: 'لابتوب HP', barcode: '1001', description: 'لابتوب HP Core i7', costPrice: '800', sellingPrice: '1000', quantity: '10', groupId: categoryId },
        { name: 'ايفون 13', barcode: '1002', description: 'هاتف ايفون 13 برو', costPrice: '900', sellingPrice: '1100', quantity: '15', groupId: categoryId },
        { name: 'سامسونج S21', barcode: '1003', description: 'هاتف سامسونج S21', costPrice: '700', sellingPrice: '850', quantity: '20', groupId: categoryId },
        { name: 'شاشة LG', barcode: '1004', description: 'شاشة LG 27 انش', costPrice: '200', sellingPrice: '300', quantity: '8', groupId: categoryId },
        { name: 'طابعة HP', barcode: '1005', description: 'طابعة HP ليزر', costPrice: '150', sellingPrice: '200', quantity: '12', groupId: categoryId }
      ];

      for (const product of products) {
        await pool.query(
          'INSERT INTO products (name, barcode, description, cost_price, selling_price, quantity, group_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [product.name, product.barcode, product.description, product.costPrice, product.sellingPrice, product.quantity, product.groupId]
        );
      }

      console.log("تم إضافة منتجات تجريبية بنجاح");
    } catch (error) {
      console.error("خطأ في إضافة المنتجات التجريبية:", error);
    }
  }

  private async addDummyCategories() {
    try {
      // إضافة 3 مجموعات تجريبية
      const categories = [
        { name: 'الكترونيات', description: 'أجهزة الكترونية متنوعة' },
        { name: 'ملابس', description: 'ملابس رجالية ونسائية' },
        { name: 'أثاث', description: 'أثاث منزلي ومكتبي' }
      ];

      for (const category of categories) {
        await pool.query(
          'INSERT INTO product_groups (name, description) VALUES ($1, $2)',
          [category.name, category.description]
        );
      }

      console.log("تم إضافة مجموعات تجريبية بنجاح");
    } catch (error) {
      console.error("خطأ في إضافة المجموعات التجريبية:", error);
    }
  }

  private async addDummyCustomers() {
    try {
      // إضافة 3 عملاء تجريبيين
      const customers = [
        { name: 'أحمد محمد', phone: '0123456789', email: 'ahmed@example.com', address: 'القاهرة، مصر', notes: 'عميل منتظم' },
        { name: 'سارة أحمد', phone: '0123456788', email: 'sara@example.com', address: 'الإسكندرية، مصر', notes: 'عميل جديد' },
        { name: 'محمد علي', phone: '0123456787', email: 'mohamed@example.com', address: 'الرياض، السعودية', notes: 'عميل مهم' }
      ];

      for (const customer of customers) {
        await pool.query(
          'INSERT INTO customers (name, phone, email, address, notes) VALUES ($1, $2, $3, $4, $5)',
          [customer.name, customer.phone, customer.email, customer.address, customer.notes]
        );
      }

      console.log("تم إضافة عملاء تجريبيين بنجاح");
    } catch (error) {
      console.error("خطأ في إضافة العملاء التجريبيين:", error);
    }
  }

  private async addDummyInvoices() {
    try {
      // جلب العملاء
      const customers = await this.getCustomers();

      // إذا لم يكن هناك عملاء، لا يمكن إضافة فواتير
      if (customers.length === 0) {
        console.log("لا يمكن إضافة فواتير بدون وجود عملاء");
        return;
      }

      // إضافة 3 فواتير تجريبية
      const invoices = [
        { customerId: customers[0].id, customerName: customers[0].name, subtotal: '1000', discount: '10', discountAmount: '100', finalTotal: '900', status: 'completed' },
        { customerId: customers[1].id, customerName: customers[1].name, subtotal: '500', discount: '5', discountAmount: '25', finalTotal: '475', status: 'pending' },
        { customerId: customers[2].id, customerName: customers[2].name, subtotal: '2000', discount: '15', discountAmount: '300', finalTotal: '1700', status: 'completed' }
      ];

      for (const invoice of invoices) {
        await pool.query(
          'INSERT INTO invoices (customer_id, customer_name, subtotal, discount, discount_amount, final_total, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [invoice.customerId, invoice.customerName, invoice.subtotal, invoice.discount, invoice.discountAmount, invoice.finalTotal, invoice.status]
        );
      }

      console.log("تم إضافة فواتير تجريبية بنجاح");
    } catch (error) {
      console.error("خطأ في إضافة الفواتير التجريبية:", error);
    }
  }


}

// إنشاء نسخة مفردة من فئة التخزين
export const storage = new Storage();