
import { insertSupplierSchema } from "@shared/schema";
import express from 'express';
import multer from 'multer';
import { storage } from "./storage";
import type { Express } from "express";
import { createServer, type Server } from "http";

const upload = multer({ dest: 'uploads/' });

export async function setupRoutes(app: Express): Promise<Server> {
  // إضافة نقطة نهاية API للتحقق من صحة قاعدة البيانات
  app.get("/api/debug/database", async (_req, res) => {
    try {
      console.log("فحص اتصال قاعدة البيانات والبيانات المخزنة...");
      
      // استرداد جميع أنواع البيانات للتشخيص
      const customers = await storage.getCustomers();
      const products = await storage.getProducts();
      const invoices = await storage.getInvoices();
      const appointments = await storage.getAppointments();
      const productGroups = await storage.getProductGroups();
      const suppliers = await storage.getSuppliers();
      
      // إنشاء تقرير تشخيصي
      const diagnosticReport = {
        dataStatus: {
          customers: {
            count: customers.length,
            sample: customers.slice(0, 3)
          },
          products: {
            count: products.length,
            sample: products.slice(0, 3)
          },
          invoices: {
            count: invoices.length,
            sample: invoices.slice(0, 3)
          },
          appointments: {
            count: appointments.length,
            sample: appointments.slice(0, 3)
          },
          productGroups: {
            count: productGroups.length,
            sample: productGroups.slice(0, 3)
          },
          suppliers: {
            count: suppliers.length,
            sample: suppliers.slice(0, 3)
          }
        },
        timestamp: new Date().toISOString()
      };
      
      console.log("تقرير تشخيص قاعدة البيانات:", JSON.stringify(diagnosticReport, null, 2));
      
      res.json({
        status: "success",
        message: "تم الاتصال بقاعدة البيانات بنجاح",
        diagnosticReport
      });
    } catch (error) {
      console.error("خطأ في فحص قاعدة البيانات:", error);
      res.status(500).json({
        status: "error",
        message: "فشل في الاتصال بقاعدة البيانات أو استرداد البيانات",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Staff Dashboard APIs
  app.get("/api/sales/today", async (_req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const invoices = await storage.getInvoices();
      console.log(`تم استرجاع ${invoices.length} فاتورة من قاعدة البيانات`);
      
      // التحقق من هيكل البيانات
      if (invoices.length > 0) {
        console.log("نموذج بيانات الفاتورة:", JSON.stringify(invoices[0], null, 2));
      }

      const todaySales = invoices.filter(invoice => {
        // التعامل مع التواريخ بشكل أكثر مرونة
        try {
          const invoiceDate = new Date(invoice.created_at || invoice.date);
          return invoiceDate >= today;
        } catch (e) {
          console.error("خطأ في تحويل التاريخ:", e);
          return false;
        }
      });

      console.log(`تم تصفية ${todaySales.length} فاتورة لهذا اليوم`);

      const total = todaySales.reduce((sum, invoice) => {
        const amount = Number(invoice.total_amount || invoice.finalTotal || 0);
        return sum + amount;
      }, 0);

      res.json({
        total,
        count: todaySales.length,
        items: todaySales.map(invoice => ({
          id: invoice.id,
          amount: invoice.total_amount || invoice.finalTotal,
          date: invoice.created_at || invoice.date,
          status: invoice.status,
          customerName: invoice.customer_name || invoice.customerName
        }))
      });
    } catch (error) {
      console.error('خطأ في استرداد بيانات المبيعات اليومية:', error);
      res.status(500).json({ error: 'فشل في استرداد بيانات المبيعات' });
    }
  });

  app.get("/api/appointments/today", async (_req, res) => {
    try {
      const appointments = await storage.getAppointments();
      console.log(`تم استرجاع ${appointments.length} موعد من قاعدة البيانات`);
      
      // التحقق من هيكل البيانات
      if (appointments.length > 0) {
        console.log("نموذج بيانات المواعيد:", JSON.stringify(appointments[0], null, 2));
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppointments = appointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.appointment_date || appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === today.getTime();
        } catch (e) {
          console.error("خطأ في تحويل تاريخ الموعد:", e);
          return false;
        }
      });
      
      console.log(`تم تصفية ${todayAppointments.length} موعد لهذا اليوم`);
      
      res.json(todayAppointments);
    } catch (error) {
      console.error('خطأ في استرداد المواعيد اليومية:', error);
      res.status(500).json({ error: 'فشل في استرداد المواعيد' });
    }
  });

  // إضافة نقاط نهاية API لاسترداد البيانات الأساسية
  app.get("/api/customers", async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error('خطأ في استرداد العملاء:', error);
      res.status(500).json({ error: 'فشل في استرداد العملاء' });
    }
  });

  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('خطأ في استرداد المنتجات:', error);
      res.status(500).json({ error: 'فشل في استرداد المنتجات' });
    }
  });

  app.get("/api/suppliers", async (_req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error('خطأ في استرداد الموردين:', error);
      res.status(500).json({ error: 'فشل في استرداد الموردين' });
    }
  });

  const server = createServer(app);
  return server;
}
