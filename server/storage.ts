import { pool, db } from './db';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// تعريف واجهة التخزين
interface IStorage {
  sessionStore: any;
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getCustomers(): Promise<any[]>;
  getCustomer(id: number): Promise<any>;
  createCustomer(customer: any): Promise<any>;
  updateCustomer(id: number, customer: any): Promise<any>;
  getAppointments(): Promise<any[]>;
  getAppointment(id: number): Promise<any>;
  createAppointment(appointment: any): Promise<any>;
  getProducts(): Promise<any[]>;
  getProduct(id: number): Promise<any>;
  createProduct(product: any): Promise<any>;
  updateProduct(id: number, product: any): Promise<any>;
  getProductGroups(): Promise<any[]>;
  getProductGroup(id: number): Promise<any>;
  createProductGroup(group: any): Promise<any>;
  getInvoices(): Promise<any[]>;
  getInvoice(id: number): Promise<any>;
  createInvoice(invoice: any): Promise<any>;
  getSuppliers(): Promise<any[]>;
  getSupplier(id: number): Promise<any>;
  createSupplier(supplier: any): Promise<any>;
  updateSupplier(id: number, supplier: any): Promise<any>;
  deleteSupplier(id: number): Promise<void>;
  getDiscountCodeByCode(code: string): Promise<any>;
  createDiscountCode(code: any): Promise<any>;
  getPurchaseOrders(): Promise<any[]>;
}

// تنفيذ كائن التخزين باستخدام قاعدة البيانات الحقيقية
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PgSessionStore = connectPgSimple(session);
    this.sessionStore = new PgSessionStore({
      pool,
      tableName: 'session',
    });
  }

  // عمليات المستخدم
  async getUser(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم باسم المستخدم:', error);
      return null;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO users(username, password, name, role) VALUES($1, $2, $3, $4) RETURNING *',
        [user.username, user.password, user.name, user.role || 'user']
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء المستخدم:', error);
      throw error;
    }
  }

  // عمليات العملاء
  async getCustomers(): Promise<any[]> {
    try {
      console.log('جاري استرداد بيانات العملاء من قاعدة البيانات...');
      const result = await pool.query('SELECT * FROM customers ORDER BY id DESC');
      console.log(`تم استرداد ${result.rows.length} عميل بنجاح`);
      if (result.rows.length > 0) {
        console.log('نموذج بيانات العميل:', JSON.stringify(result.rows[0], null, 2));
      }
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على العملاء:', error);
      if (error instanceof Error) {
        console.error('رسالة الخطأ:', error.message);
        console.error('تفاصيل الخطأ:', error.stack);
      }
      return [];
    }
  }

  async getCustomer(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على العميل:', error);
      return null;
    }
  }

  async createCustomer(customer: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO customers(name, phone, email, address, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *',
        [customer.name, customer.phone, customer.email, customer.address]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء العميل:', error);
      throw error;
    }
  }

  async updateCustomer(id: number, customer: any): Promise<any> {
    try {
      const result = await pool.query(
        'UPDATE customers SET name = $1, phone = $2, email = $3, address = $4 WHERE id = $5 RETURNING *',
        [customer.name, customer.phone, customer.email, customer.address, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في تحديث العميل:', error);
      throw error;
    }
  }

  // عمليات المواعيد
  async getAppointments(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM appointments ORDER BY appointment_date DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على المواعيد:', error);
      return [];
    }
  }

  async getAppointment(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على الموعد:', error);
      return null;
    }
  }

  async createAppointment(appointment: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO appointments(customer_id, appointment_date, service, status, notes, created_at) VALUES($1, $2, $3, $4, $5, NOW()) RETURNING *',
        [appointment.customerId, appointment.appointmentDate, appointment.service, appointment.status, appointment.notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء الموعد:', error);
      throw error;
    }
  }

  // عمليات المنتجات
  async getProducts(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على المنتجات:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على المنتج:', error);
      return null;
    }
  }

  async createProduct(product: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO products(name, sku, price, cost, quantity, group_id, created_at) VALUES($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
        [product.name, product.sku, product.price, product.cost, product.quantity, product.groupId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء المنتج:', error);
      throw error;
    }
  }

  async updateProduct(id: number, product: any): Promise<any> {
    try {
      const result = await pool.query(
        'UPDATE products SET name = $1, sku = $2, price = $3, cost = $4, quantity = $5, group_id = $6 WHERE id = $7 RETURNING *',
        [product.name, product.sku, product.price, product.cost, product.quantity, product.groupId, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      throw error;
    }
  }

  // عمليات مجموعات المنتجات
  async getProductGroups(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM product_groups ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على مجموعات المنتجات:', error);
      return [];
    }
  }

  async getProductGroup(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM product_groups WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على مجموعة المنتجات:', error);
      return null;
    }
  }

  async createProductGroup(group: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO product_groups(name, description, created_at) VALUES($1, $2, NOW()) RETURNING *',
        [group.name, group.description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء مجموعة المنتجات:', error);
      throw error;
    }
  }

  // عمليات الفواتير
  async getInvoices(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM invoices ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على الفواتير:', error);
      return [];
    }
  }

  async getInvoice(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على الفاتورة:', error);
      return null;
    }
  }

  async createInvoice(invoice: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO invoices(customer_id, total_amount, status, payment_method, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *',
        [invoice.customerId, invoice.totalAmount, invoice.status, invoice.paymentMethod]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء الفاتورة:', error);
      throw error;
    }
  }

  // عمليات الموردين
  async getSuppliers(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM suppliers ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على الموردين:', error);
      return [];
    }
  }

  async getSupplier(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على المورد:', error);
      return null;
    }
  }

  async createSupplier(supplier: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO suppliers(name, contact_name, phone, email, address, created_at) VALUES($1, $2, $3, $4, $5, NOW()) RETURNING *',
        [supplier.name, supplier.contactName, supplier.phone, supplier.email, supplier.address]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء المورد:', error);
      throw error;
    }
  }

  async updateSupplier(id: number, supplier: any): Promise<any> {
    try {
      const result = await pool.query(
        'UPDATE suppliers SET name = $1, contact_name = $2, phone = $3, email = $4, address = $5 WHERE id = $6 RETURNING *',
        [supplier.name, supplier.contactName, supplier.phone, supplier.email, supplier.address, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في تحديث المورد:', error);
      throw error;
    }
  }

  async deleteSupplier(id: number): Promise<void> {
    try {
      await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    } catch (error) {
      console.error('خطأ في حذف المورد:', error);
      throw error;
    }
  }

  async getDiscountCodeByCode(code: string): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM discount_codes WHERE code = $1', [code]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على رمز الخصم:', error);
      return null;
    }
  }

  async createDiscountCode(code: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO discount_codes(code, discount_type, discount_value, valid_from, valid_to, usage_limit, used_count, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
        [code.code, code.discountType, code.discountValue, code.validFrom, code.validTo, code.usageLimit, 0]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء رمز الخصم:', error);
      throw error;
    }
  }

  async getPurchaseOrders(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM purchase_orders ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على أوامر الشراء:', error);
      return [];
    }
  }
}

// إنشاء كائن التخزين للاستخدام في التطبيق
export const storage = new DatabaseStorage();