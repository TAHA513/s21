import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { logger } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic API routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      logger.error('Error fetching products:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتجات' });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      logger.error('Error creating product:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المنتج' });
    }
  });

  app.get("/api/invoices", async (_req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب الفواتير' });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.json(invoice);
    } catch (error) {
      logger.error('Error creating invoice:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الفاتورة' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}