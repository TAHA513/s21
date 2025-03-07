
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from "./db.js";

const upload = multer({ dest: 'uploads/' });

export async function setupRoutes(app: Express): Promise<void> {
  // لم نعد بحاجة لإنشاء server هنا لأنه سيأتي من ملف index.ts

  // نقطة نهاية للتحقق من اتصال قاعدة البيانات
  app.get("/api/health", async (_req, res) => {
    try {
      // التحقق من اتصال قاعدة البيانات
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

  // Products API - واجهة برمجة المنتجات
  app.get("/api/products", async (_req, res) => {
    try {
      console.log("استلام طلب للحصول على المنتجات");
      const products = await storage.getProducts();
      console.log(`تم استرجاع ${products.length} منتج بنجاح`);
      console.log("عينة من البيانات:", JSON.stringify(products.slice(0, 2), null, 2));
      
      // إرسال استجابة مع رأس واضح لتتبع العمليات في المتصفح
      res.setHeader('X-Data-Length', products.length.toString());
      res.setHeader('X-Request-Status', 'success');
      res.json({
        status: "success",
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('خطأ في استرجاع المنتجات:', error);
      res.status(500).json({ 
        status: "error", 
        message: 'حدث خطأ أثناء استرجاع المنتجات',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: 'المنتج غير موجود' });
      }
      res.json(product);
    } catch (error) {
      console.error('خطأ في استرجاع المنتج:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء استرجاع المنتج' });
    }
  });

  // Customers API - واجهة برمجة العملاء
  app.get("/api/customers", async (_req, res) => {
    try {
      console.log("استلام طلب للحصول على العملاء");
      const customers = await storage.getCustomers();
      console.log(`تم استرجاع ${customers.length} عميل بنجاح`);
      console.log("عينة من البيانات:", JSON.stringify(customers.slice(0, 2), null, 2));
      
      res.setHeader('X-Data-Length', customers.length.toString());
      res.setHeader('X-Request-Status', 'success');
      res.json({
        status: "success",
        count: customers.length,
        data: customers
      });
    } catch (error) {
      console.error('خطأ في استرجاع العملاء:', error);
      res.status(500).json({ 
        status: "error", 
        message: 'حدث خطأ أثناء استرجاع العملاء',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: 'العميل غير موجود' });
      }
      res.json(customer);
    } catch (error) {
      console.error('خطأ في استرجاع العميل:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء استرجاع العميل' });
    }
  });

  // Invoices API - واجهة برمجة الفواتير
  app.get("/api/invoices", async (_req, res) => {
    try {
      console.log("استلام طلب للحصول على الفواتير");
      const invoices = await storage.getInvoices();
      console.log(`تم استرجاع ${invoices.length} فاتورة بنجاح`);
      console.log("عينة من البيانات:", JSON.stringify(invoices.slice(0, 2), null, 2));
      
      res.setHeader('X-Data-Length', invoices.length.toString());
      res.setHeader('X-Request-Status', 'success');
      res.json({
        status: "success",
        count: invoices.length,
        data: invoices
      });
    } catch (error) {
      console.error('خطأ في استرجاع الفواتير:', error);
      res.status(500).json({ 
        status: "error", 
        message: 'حدث خطأ أثناء استرجاع الفواتير',
        error: error instanceof Error ? error.message : String(error)
      });
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

  // عرض الملفات المرفوعة
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // لا نحتاج لإرجاع server
}
