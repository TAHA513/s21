
import { pool, db } from './db';
import { eq } from 'drizzle-orm';

// تعريف واجهة التخزين
interface IStorage {
  sessionStore: any;
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getCustomers(): Promise<any[]>;
  getCustomer(id: number): Promise<any>;
  createCustomer(customer: any): Promise<any>;
  getAppointments(): Promise<any[]>;
  getAppointment(id: number): Promise<any>;
  createAppointment(appointment: any): Promise<any>;
  getProducts(): Promise<any[]>;
  getProduct(id: number): Promise<any>;
  createProduct(product: any): Promise<any>;
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
}

// تنفيذ كائن التخزين باستخدام قاعدة البيانات الحقيقية
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = {};
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
      const result = await pool.query('SELECT * FROM customers ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على العملاء:', error);
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
        'INSERT INTO customers(name, phone, email, address, notes, created_at, updated_at) VALUES($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [customer.name, customer.phone, customer.email, customer.address, customer.notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء العميل:', error);
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
        'INSERT INTO suppliers(name, phone, email, address, notes, created_at, updated_at) VALUES($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [supplier.name, supplier.phone, supplier.email, supplier.address, supplier.notes]
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
        'UPDATE suppliers SET name=$1, phone=$2, email=$3, address=$4, notes=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
        [supplier.name, supplier.phone, supplier.email, supplier.address, supplier.notes, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في تحديث المورد:', error);
      return null;
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

  // تنفيذ باقي الوظائف
  async getAppointments(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM appointments ORDER BY appointment_date ASC');
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
        'INSERT INTO appointments(customer_id, appointment_date, services, status, notes, created_at, updated_at) VALUES($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [appointment.customerId, appointment.appointmentDate, appointment.services, appointment.status, appointment.notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء الموعد:', error);
      throw error;
    }
  }

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
        'INSERT INTO products(name, group_id, price, cost, sku, stock, description, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
        [product.name, product.groupId, product.price, product.cost, product.sku, product.stock, product.description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء المنتج:', error);
      throw error;
    }
  }

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
        'INSERT INTO product_groups(name, description, created_at, updated_at) VALUES($1, $2, NOW(), NOW()) RETURNING *',
        [group.name, group.description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء مجموعة المنتجات:', error);
      throw error;
    }
  }

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
        'INSERT INTO invoices(customer_id, invoice_date, total, status, items, notes, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
        [invoice.customerId, invoice.invoiceDate, invoice.total, invoice.status, JSON.stringify(invoice.items), invoice.notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء الفاتورة:', error);
      throw error;
    }
  }

  // إضافة وظائف إضافية لدعم باقي وظائف النظام
  async getInstallmentPlans(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM installment_plans ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على خطط التقسيط:', error);
      return [];
    }
  }

  async getInstallmentPlan(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM installment_plans WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على خطة التقسيط:', error);
      return null;
    }
  }

  async createInstallmentPlan(plan: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO installment_plans(customer_name, phone_number, total_amount, down_payment, installment_amount, installments_count, start_date, notes, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
        [plan.customerName, plan.phoneNumber, plan.totalAmount, plan.downPayment, plan.installmentAmount, plan.installmentsCount, plan.startDate, plan.notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء خطة التقسيط:', error);
      throw error;
    }
  }

  async getInstallmentPayments(planId: number): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM installment_payments WHERE plan_id = $1 ORDER BY due_date ASC', [planId]);
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على دفعات التقسيط:', error);
      return [];
    }
  }

  async createInstallmentPayment(payment: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO installment_payments(plan_id, amount, status, due_date, paid_date, notes, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
        [payment.planId, payment.amount, payment.status, payment.dueDate, payment.paidDate, payment.notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء دفعة التقسيط:', error);
      throw error;
    }
  }

  async getMarketingCampaigns(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM marketing_campaigns ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على حملات التسويق:', error);
      return [];
    }
  }

  async getMarketingCampaign(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM marketing_campaigns WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على حملة التسويق:', error);
      return null;
    }
  }

  async createMarketingCampaign(campaign: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO marketing_campaigns(name, description, start_date, end_date, budget, status, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
        [campaign.name, campaign.description, campaign.startDate, campaign.endDate, campaign.budget, campaign.status]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء حملة التسويق:', error);
      throw error;
    }
  }

  async getScheduledPosts(campaignId: number): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM scheduled_posts WHERE campaign_id = $1 ORDER BY schedule_time ASC', [campaignId]);
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على المنشورات المجدولة:', error);
      return [];
    }
  }

  async createScheduledPost(post: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO scheduled_posts(campaign_id, content, platform, schedule_time, status, created_at, updated_at) VALUES($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [post.campaignId, post.content, post.platform, post.scheduleTime, post.status]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء منشور مجدول:', error);
      throw error;
    }
  }

  async getDiscountCodes(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM discount_codes ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('خطأ في الحصول على رموز الخصم:', error);
      return [];
    }
  }

  async getDiscountCode(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM discount_codes WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على رمز الخصم:', error);
      return null;
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

  async getPurchaseOrder(id: number): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('خطأ في الحصول على أمر الشراء:', error);
      return null;
    }
  }

  async createPurchaseOrder(order: any): Promise<any> {
    try {
      const result = await pool.query(
        'INSERT INTO purchase_orders(supplier_id, order_date, total, status, items, notes, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
        [order.supplierId, order.orderDate, order.total, order.status, JSON.stringify(order.items), order.notes]
      );
      return result.rows[0];
    } catch (error) {
      console.error('خطأ في إنشاء أمر الشراء:', error);
      throw error;
    }
  }
}

// تصدير كائن التخزين
export const storage = new DatabaseStorage();
