import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import multer from 'multer';
import { backupService } from './services/backup-service';
import { WebSocketServer } from 'ws';

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for CRUD operations
  app.get("/api/products", async (_req, res) => {
    try {
      console.log('Fetching products...');
      const products = await storage.getProducts();
      console.log('Products fetched successfully:', products);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتجات' });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      console.log('Creating product with data:', req.body);

      // Convert numeric strings to actual numbers for validation
      const productData = {
        ...req.body,
        quantity: parseInt(req.body.quantity, 10),
        minimumQuantity: parseInt(req.body.minimumQuantity, 10),
        costPrice: parseFloat(req.body.costPrice),
        sellingPrice: parseFloat(req.body.sellingPrice)
      };

      console.log('Processed product data:', productData);

      const product = await storage.createProduct(productData);
      console.log('Product created successfully:', product);
      res.json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المنتج' });
    }
  });

  app.get("/api/product-groups", async (_req, res) => {
    try {
      const groups = await storage.getProductGroups();
      console.log('Sending product groups to client:', groups);
      res.json(groups);
    } catch (error) {
      console.error('Error fetching product groups:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب مجموعات المنتجات' });
    }
  });

  app.post("/api/product-groups", async (req, res) => {
    try {
      console.log('Received product group data:', req.body);
      const group = await storage.createProductGroup(req.body);
      console.log('Created product group:', group);
      res.json(group);
    } catch (error) {
      console.error('Error creating product group:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء مجموعة المنتجات' });
    }
  });

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
          amount: Number(invoice.finalTotal),
          date: invoice.date,
          customerName: invoice.customerName
        }))
      });
    } catch (error) {
      console.error('Error fetching today sales:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب مبيعات اليوم' });
    }
  });

  // Backup and Restore endpoints
  app.post('/api/backup/generate', async (_req, res) => {
    try {
      const backupPath = await backupService.generateBackup();
      res.download(backupPath);
    } catch (error) {
      console.error('Error generating backup:', error);
      res.status(500).json({ error: 'فشل إنشاء النسخة الاحتياطية' });
    }
  });

  app.post('/api/backup/restore', upload.single('backup'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم تحميل أي ملف' });
      }

      await backupService.restoreBackup(req.file.path);
      res.json({ message: 'تم استعادة النسخة الاحتياطية بنجاح' });
    } catch (error) {
      console.error('Error restoring backup:', error);
      res.status(500).json({ error: 'فشل استعادة النسخة الاحتياطية' });
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
      console.error('Error fetching today appointments:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب مواعيد اليوم' });
    }
  });

  app.get("/api/products/low-stock", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      const lowStock = products.filter(product => Number(product.quantity) < 10);

      const productsWithGroups = await Promise.all(
        lowStock.map(async (product) => {
          const group = await storage.getProductGroup(product.groupId);
          return {
            ...product,
            groupName: group?.name
          };
        })
      );

      res.json(productsWithGroups);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتجات منخفضة المخزون' });
    }
  });

  app.get("/api/staff/quick-stats", async (_req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const invoices = await storage.getInvoices();
      const todaySales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= today;
      });
      const totalSales = todaySales.reduce((sum, invoice) => sum + Number(invoice.finalTotal), 0);

      const appointments = await storage.getAppointments();
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= today;
      });

      const products = await storage.getProducts();
      const lowStockCount = products.filter(product => Number(product.quantity) < 10).length;

      res.json({
        totalSales,
        appointmentsCount: todayAppointments.length,
        lowStockCount,
        salesCount: todaySales.length
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات السريعة' });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server with explicit port
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
      console.log('Received:', message);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Set port explicitly for both HTTP and WebSocket
  const port = process.env.PORT || 5000;
  app.set('port', port);

  return httpServer;
}