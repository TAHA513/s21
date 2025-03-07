import { pool, db } from './db.js';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { eq } from 'drizzle-orm';
import { customers, products, productGroups, invoices, type Customer, type Product, type ProductGroup, type Invoice } from '@shared/schema';

interface FileInfo {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  uploadedAt: string;
}

interface IStorage {
  sessionStore: any;
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | null>;
  createCustomer(customer: any): Promise<Customer>;
  updateCustomer(id: number, customer: any): Promise<Customer | null>;
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
  createProduct(product: any): Promise<Product>;
  updateProduct(id: number, product: any): Promise<Product | null>;
  getProductGroups(): Promise<ProductGroup[]>;
  getProductGroup(id: number): Promise<ProductGroup | null>;
  createProductGroup(group: any): Promise<ProductGroup>;
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | null>;
  createInvoice(invoice: any): Promise<Invoice>;
  getSuppliers(): Promise<any[]>;
  getSupplier(id: number): Promise<any>;
  createSupplier(supplier: any): Promise<any>;
  updateSupplier(id: number, supplier: any): Promise<any>;
  deleteSupplier(id: number): Promise<void>;
  getDiscountCodeByCode(code: string): Promise<any>;
  createDiscountCode(code: any): Promise<any>;
  getPurchaseOrders(): Promise<any[]>
  saveFileInfo(fileInfo: FileInfo): Promise<FileInfo>;
  getFiles(): Promise<FileInfo[]>;
}

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
  async getUser(id: number) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم:', error);
      return null;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم باسم المستخدم:', error);
      return null;
    }
  }

  async createUser(user: any) {
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
  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('جاري استرداد بيانات العملاء...');
      const result = await db.select().from(customers).orderBy(customers.id);
      console.log(`تم استرداد ${result.length} عميل`);
      return result;
    } catch (error) {
      console.error('خطأ في الحصول على العملاء:', error);
      throw error;
    }
  }

  async getCustomer(id: number): Promise<Customer | null> {
    try {
      const result = await db.select().from(customers).where(eq(customers.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على العميل:', error);
      throw error;
    }
  }

  async createCustomer(customer: any): Promise<Customer> {
    try {
      console.log('بيانات العميل المستلمة للإنشاء:', customer);
      const result = await db.insert(customers).values({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        notes: customer.notes
      }).returning();
      console.log('تم إنشاء العميل:', result[0]);
      return result[0];
    } catch (error) {
      console.error('خطأ في إنشاء العميل:', error);
      throw error;
    }
  }

  async updateCustomer(id: number, customer: any): Promise<Customer | null> {
    try {
      const result = await db.update(customers)
        .set({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          notes: customer.notes
        })
        .where(eq(customers.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('خطأ في تحديث العميل:', error);
      throw error;
    }
  }

  // عمليات المنتجات
  async getProducts(): Promise<Product[]> {
    try {
      const result = await db.select().from(products).orderBy(products.id);
      return result;
    } catch (error) {
      console.error('خطأ في الحصول على المنتجات:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<Product | null> {
    try {
      const result = await db.select().from(products).where(eq(products.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على المنتج:', error);
      throw error;
    }
  }

  async createProduct(product: any): Promise<Product> {
    try {
      console.log('بيانات المنتج المستلمة للإنشاء:', product);
      const result = await db.insert(products).values({
        name: product.name,
        barcode: product.barcode,
        description: product.description,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        minimumQuantity: product.minimumQuantity,
        type: product.type || 'piece',
        isWeighted: product.isWeighted || false,
        groupId: product.groupId
      }).returning();
      console.log('تم إنشاء المنتج:', result[0]);
      return result[0];
    } catch (error) {
      console.error('خطأ في إنشاء المنتج:', error);
      throw error;
    }
  }

  async updateProduct(id: number, product: any): Promise<Product | null> {
    try {
      const result = await db.update(products)
        .set({
          name: product.name,
          barcode: product.barcode,
          description: product.description,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          quantity: product.quantity,
          minimumQuantity: product.minimumQuantity,
          type: product.type,
          isWeighted: product.isWeighted,
          groupId: product.groupId
        })
        .where(eq(products.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      throw error;
    }
  }

  // عمليات مجموعات المنتجات
  async getProductGroups(): Promise<ProductGroup[]> {
    try {
      const result = await db.select().from(productGroups).orderBy(productGroups.id);
      return result;
    } catch (error) {
      console.error('خطأ في الحصول على مجموعات المنتجات:', error);
      throw error;
    }
  }

  async getProductGroup(id: number): Promise<ProductGroup | null> {
    try {
      const result = await db.select().from(productGroups).where(eq(productGroups.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على مجموعة المنتجات:', error);
      throw error;
    }
  }

  async createProductGroup(group: any): Promise<ProductGroup> {
    try {
      const result = await db.insert(productGroups).values({
        name: group.name,
        description: group.description
      }).returning();
      return result[0];
    } catch (error) {
      console.error('خطأ في إنشاء مجموعة المنتجات:', error);
      throw error;
    }
  }

  // عمليات الفواتير
  async getInvoices(): Promise<Invoice[]> {
    try {
      const result = await db.select().from(invoices).orderBy(invoices.id);
      return result;
    } catch (error) {
      console.error('خطأ في الحصول على الفواتير:', error);
      throw error;
    }
  }

  async getInvoice(id: number): Promise<Invoice | null> {
    try {
      const result = await db.select().from(invoices).where(eq(invoices.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على الفاتورة:', error);
      throw error;
    }
  }

  async createInvoice(invoice: any): Promise<Invoice> {
    try {
      console.log('بيانات الفاتورة المستلمة للإنشاء:', invoice);
      const result = await db.insert(invoices).values({
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        subtotal: invoice.subtotal,
        discount: invoice.discount,
        discountAmount: invoice.discountAmount,
        finalTotal: invoice.finalTotal,
        status: invoice.status
      }).returning();
      console.log('تم إنشاء الفاتورة:', result[0]);
      return result[0];
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

  // حفظ معلومات الملف
  async saveFileInfo(fileInfo: FileInfo): Promise<FileInfo> {
    try {
      const result = await pool.query(
        'INSERT INTO files (filename, original_name, path, size, uploaded_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [fileInfo.filename, fileInfo.originalName, fileInfo.path, fileInfo.size, fileInfo.uploadedAt]
      );
      return this.mapFileRecord(result.rows[0]);
    } catch (error) {
      console.error('خطأ في حفظ معلومات الملف:', error);
      throw error;
    }
  }

  // جلب قائمة الملفات
  async getFiles(): Promise<FileInfo[]> {
    try {
      const result = await pool.query('SELECT * FROM files ORDER BY uploaded_at DESC');
      return result.rows.map(this.mapFileRecord);
    } catch (error) {
      console.error('خطأ في جلب قائمة الملفات:', error);
      return [];
    }
  }

  private mapFileRecord(record: any): FileInfo {
    return {
      filename: record.filename,
      originalName: record.original_name,
      path: record.path,
      size: record.size,
      uploadedAt: record.uploaded_at
    };
  }
}

export const storage = new DatabaseStorage();