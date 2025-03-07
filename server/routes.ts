
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import multer from 'multer';
import path from 'path';

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB كحد أقصى
});

export async function registerRoutes(app: Express): Promise<Server> {
  // إنشاء مجلد التحميلات إذا لم يكن موجودًا
  const uploadsDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Staff Dashboard APIs
  app.get("/api/sales/today", async (_req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const invoices = await storage.getInvoices();
      const todaySales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= today;
      });

      const total = todaySales.reduce((sum, invoice) => sum + Number(invoice.finalTotal), 0);

      res.json({
        total,
        count: todaySales.length,
        items: todaySales.map(invoice => ({
          id: invoice.id,
          amount: invoice.finalTotal,
          date: invoice.date,
          status: invoice.status,
          customerName: invoice.customerName
        }))
      });
    } catch (error) {
      console.error('خطأ في جلب المبيعات اليومية:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات المبيعات' });
    }
  });

  app.get("/api/appointments/today", async (_req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await storage.getAppointments();
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= today && aptDate < tomorrow;
      });

      // Get customer details for each appointment
      const appointmentsWithDetails = await Promise.all(
        todayAppointments.map(async (apt) => {
          const customer = await storage.getCustomer(apt.customerId);
          return {
            ...apt,
            customerName: customer?.name,
            customerPhone: customer?.phone
          };
        })
      );

      res.json(appointmentsWithDetails);
    } catch (error) {
      console.error('خطأ في جلب المواعيد اليومية:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات المواعيد' });
    }
  });

  app.get("/api/products/low-stock", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      const lowStock = products.filter(product => Number(product.quantity) < 10);

      res.json(lowStock);
    } catch (error) {
      console.error('خطأ في جلب المنتجات منخفضة المخزون:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات المنتجات' });
    }
  });

  // إضافة API للإحصائيات السريعة للموظفين
  app.get("/api/staff/quick-stats", async (_req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // الحصول على إجمالي المبيعات
      const invoices = await storage.getInvoices();
      const todaySales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= today;
      });
      const totalSales = todaySales.reduce((sum, invoice) => sum + Number(invoice.finalTotal), 0);

      // الحصول على عدد المواعيد
      const appointments = await storage.getAppointments();
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= today;
      });

      // الحصول على المنتجات منخفضة المخزون
      const products = await storage.getProducts();
      const lowStockCount = products.filter(product => Number(product.quantity) < 10).length;

      res.json({
        totalSales,
        appointmentsCount: todayAppointments.length,
        lowStockCount,
        salesCount: todaySales.length
      });
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات السريعة:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات' });
    }
  });

  // إضافة API لإدارة اتصالات قواعد البيانات
  app.get('/api/database-connections', async (req, res) => {
    try {
      const connections = await storage.getDatabaseConnections();
      // لا نقوم بإرجاع كلمات المرور أو بيانات الاتصال الحساسة
      const safeConnections = connections.map(conn => ({
        ...conn,
        connectionString: '******',
        password: undefined
      }));
      res.json(safeConnections);
    } catch (error) {
      console.error('خطأ في جلب اتصالات قواعد البيانات:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب اتصالات قواعد البيانات' });
    }
  });

  app.post('/api/database-connections', async (req, res) => {
    try {
      const connection = req.body;
      const isValid = await storage.testDatabaseConnection(connection);
      
      if (!isValid) {
        return res.status(400).json({ error: 'فشل الاتصال بقاعدة البيانات. تحقق من معلومات الاتصال.' });
      }
      
      const newConnection = await storage.createDatabaseConnection(connection);
      res.status(201).json({
        ...newConnection,
        connectionString: '******',
        password: undefined
      });
    } catch (error) {
      console.error('خطأ في إنشاء اتصال قاعدة بيانات:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء اتصال قاعدة البيانات' });
    }
  });

  app.post('/api/test-database', async (req, res) => {
    try {
      const connection = req.body;
      const isValid = await storage.testDatabaseConnection(connection);
      res.json({ success: isValid });
    } catch (error) {
      console.error('خطأ في اختبار اتصال قاعدة البيانات:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء اختبار اتصال قاعدة البيانات' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
