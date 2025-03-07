
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

export async function setupRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // نقطة نهاية للتحقق من اتصال قاعدة البيانات
  app.get("/api/health", async (_req, res) => {
    try {
      // التحقق من حالة التطبيق
      res.json({
        status: "online",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في فحص حالة التطبيق:', error);
      res.status(500).json({ 
        status: "error",
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
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('خطأ في استرجاع المنتجات:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء استرجاع المنتجات' });
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
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error('خطأ في استرجاع العملاء:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء استرجاع العملاء' });
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
      const invoices = await storage.getInvoices();
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

  // عرض الملفات المرفوعة
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  return server;
}
