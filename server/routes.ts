import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// تكوين multer مع تحديد مسار التخزين واسم الملف
const storage_config = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = 'uploads';
    // إنشاء مجلد التحميلات إذا لم يكن موجوداً
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    // استخدام الطابع الزمني مع اسم الملف الأصلي
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_config });

export async function setupRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // نقطة نهاية API للتحقق من اتصال قاعدة البيانات
  app.get("/api/health", async (_req, res) => {
    try {
      const result = await pool.query('SELECT NOW() as server_time');
      res.json({
        status: "online",
        database: "connected",
        server_time: result.rows[0]?.server_time,
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      console.error('خطأ في فحص حالة قاعدة البيانات:', error);
      res.status(500).json({
        status: "online",
        database: "error",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // جلب قائمة المنتجات
  app.get("/api/products", async (_req, res) => {
    try {
      console.log('جاري جلب المنتجات...');
      // إضافة رؤوس لمنع التخزين المؤقت
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const products = await storage.getProducts();
      console.log(`تم جلب ${products.length} منتج`);
      res.json(products);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      res.status(500).json({ error: 'فشل في جلب المنتجات' });
    }
  });

  // جلب منتج محدد
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: 'المنتج غير موجود' });
      }
      res.json(product);
    } catch (error) {
      console.error('خطأ في جلب المنتج:', error);
      res.status(500).json({ error: 'فشل في جلب المنتج' });
    }
  });

  // إضافة منتج جديد
  app.post("/api/products", async (req, res) => {
    try {
      console.log('بيانات المنتج المستلمة:', req.body);
      const product = await storage.createProduct(req.body);
      console.log('تم إنشاء المنتج:', product);
      res.status(201).json(product);
    } catch (error) {
      console.error('خطأ في إنشاء المنتج:', error);
      res.status(500).json({ error: 'فشل في إنشاء المنتج' });
    }
  });

  // تحديث منتج
  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`تحديث المنتج ${id}:`, req.body);
      const product = await storage.updateProduct(id, req.body);
      console.log('تم تحديث المنتج:', product);
      res.json(product);
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      res.status(500).json({ error: 'فشل في تحديث المنتج' });
    }
  });

  // جلب قائمة العملاء
  app.get("/api/customers", async (_req, res) => {
    try {
      console.log('جاري جلب العملاء...');
      // إضافة رؤوس لمنع التخزين المؤقت
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const customers = await storage.getCustomers();
      console.log(`تم جلب ${customers.length} عميل`);
      res.json(customers);
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      res.status(500).json({ error: 'فشل في جلب العملاء' });
    }
  });

  // جلب عميل محدد
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: 'العميل غير موجود' });
      }
      res.json(customer);
    } catch (error) {
      console.error('خطأ في جلب العميل:', error);
      res.status(500).json({ error: 'فشل في جلب العميل' });
    }
  });

  // إضافة عميل جديد
  app.post("/api/customers", async (req, res) => {
    try {
      console.log('بيانات العميل المستلمة:', req.body);
      const customer = await storage.createCustomer(req.body);
      console.log('تم إنشاء العميل:', customer);
      res.status(201).json(customer);
    } catch (error) {
      console.error('خطأ في إنشاء العميل:', error);
      res.status(500).json({ error: 'فشل في إنشاء العميل' });
    }
  });

  // تحديث عميل
  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`تحديث العميل ${id}:`, req.body);
      const customer = await storage.updateCustomer(id, req.body);
      console.log('تم تحديث العميل:', customer);
      res.json(customer);
    } catch (error) {
      console.error('خطأ في تحديث العميل:', error);
      res.status(500).json({ error: 'فشل في تحديث العميل' });
    }
  });

  // إنشاء فاتورة جديدة
  app.post("/api/invoices", async (req, res) => {
    try {
      console.log('بيانات الفاتورة المستلمة:', req.body);
      const invoice = await storage.createInvoice(req.body);
      console.log('تم إنشاء الفاتورة:', invoice);
      res.status(201).json(invoice);
    } catch (error) {
      console.error('خطأ في إنشاء الفاتورة:', error);
      res.status(500).json({ error: 'فشل في إنشاء الفاتورة' });
    }
  });

  // Dashboard APIs - بيانات اللوحة الرئيسية
  app.get("/api/dashboard/summary", async (_req, res) => {
    try {
      const invoices = await storage.getInvoices();
      const products = await storage.getProducts();
      const customers = await storage.getCustomers();

      // حساب إجمالي المبيعات
      const totalSales = invoices.reduce((sum, invoice) => sum + Number(invoice.finalTotal), 0);

      // عدد الطلبات المكتملة
      const completedOrders = invoices.filter(inv => inv.status === 'completed').length;

      res.json({
        totalSales,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalOrders: invoices.length,
        completedOrders
      });
    } catch (error) {
      console.error('خطأ في استرجاع ملخص اللوحة الرئيسية:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء استرجاع ملخص اللوحة الرئيسية' });
    }
  });

  // نقاط النهاية API للمنتجات والعملاء تم تعريفها بالفعل في الأعلى

  // Invoices API - واجهة برمجة الفواتير
  app.get("/api/invoices", async (_req, res) => {
    try {
      // إضافة رؤوس لمنع التخزين المؤقت
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const invoices = await storage.getInvoices();
      console.log(`تم جلب ${invoices.length} فاتورة`);
      res.json(invoices);
    } catch (error) {
      console.error('خطأ في استرجاع الفواتير:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء استرجاع الفواتير' });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ error: 'الفاتورة غير موجودة' });
      }
      res.json(invoice);
    } catch (error) {
      console.error('خطأ في استرجاع الفاتورة:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء استرجاع الفاتورة' });
    }
  });

  // إضافة نقطة نهاية API للتحقق من صحة قاعدة البيانات
  app.get("/api/debug/database", async (_req, res) => {
    try {
      // جمع كل البيانات من التخزين
      const products = await storage.getProducts();
      const categories = await storage.getCategories();
      const customers = await storage.getCustomers();
      const invoices = await storage.getInvoices();
      const users = await storage.getUsers();

      // إرجاع كل البيانات كتقرير واحد
      res.json({
        products: {
          count: products.length,
          items: products
        },
        categories: {
          count: categories.length,
          items: categories
        },
        customers: {
          count: customers.length,
          items: customers
        },
        invoices: {
          count: invoices.length,
          items: invoices
        },
        users: {
          count: users.length,
          items: users.map(u => ({ id: u.id, username: u.username, role: u.role }))
        }
      });
    } catch (error) {
      console.error('خطأ في فحص قاعدة البيانات:', error);
      res.status(500).json({ error: 'فشل فحص قاعدة البيانات: ' + String(error) });
    }
  });

  // نقطة نهاية لتحميل الملفات
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم تحميل أي ملف' });
      }

      // حفظ معلومات الملف في قاعدة البيانات
      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      };

      // تخزين معلومات الملف (يجب إضافة هذه الوظيفة في storage)
      await storage.saveFileInfo(fileInfo);

      res.json({
        message: 'تم تحميل الملف بنجاح',
        file: fileInfo
      });
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
      res.status(500).json({ error: 'فشل تحميل الملف' });
    }
  });

  // نقطة نهاية لجلب قائمة الملفات
  app.get('/api/files', async (_req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      console.error('خطأ في جلب قائمة الملفات:', error);
      res.status(500).json({ error: 'فشل جلب قائمة الملفات' });
    }
  });

  // تكوين مسار ثابت للوصول إلى الملفات المحملة
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  return server;
}

const pool = { query: async (query: string) => {
    //Mock Implementation.  Replace with your actual database query function.
    if (query === 'SELECT NOW() as server_time'){
      return {rows: [{server_time: new Date()}]}
    }
    return {rows: []}
  }
}