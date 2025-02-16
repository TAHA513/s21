import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import { setupAuth } from "./auth";
import { hashPassword } from "./auth"; // Assuming hashPassword is defined here


export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for handling JSON responses
  app.use(express.json());

  // تكوين المصادقة
  setupAuth(app);

  // إنشاء مستخدم مدير افتراضي إذا لم يكن هناك مستخدمين
  app.post("/api/setup", async (req, res) => {
    try {
      // التحقق من وجود مستخدمين
      const users = await storage.getUsers();
      if (users.length > 0) {
        return res.status(400).json({ message: "تم إعداد النظام بالفعل" });
      }

      // إنشاء مستخدم مدير جديد
      const adminUser = await storage.createUser({
        username: "admin",
        password: await hashPassword("admin123"),
        role: "admin",
        name: "مدير النظام",
      });

      res.status(201).json({
        message: "تم إعداد النظام بنجاح",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          name: adminUser.name
        }
      });
    } catch (error: any) {
      console.error('Error setting up system:', error);
      res.status(500).json({
        message: "حدث خطأ أثناء إعداد النظام",
        error: error.message
      });
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
          amount: invoice.finalTotal,
          date: invoice.date,
          status: 'completed',
          customerName: invoice.customerName
        }))
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات المبيعات" });
    }
  });

  // Admin credentials management
  app.post("/api/admin/credentials", async (req, res) => {
    try {
      const { username, password, name } = req.body;

      // التحقق من وجود المستخدم
      const existingAdmin = await storage.getUserByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      // إنشاء مستخدم جديد بصلاحيات المدير
      const hashedPassword = await hashPassword(password);
      const adminUser = await storage.createUser({
        username,
        password: hashedPassword,
        role: "admin",
        name: name || null, // إضافة الاسم إذا تم توفيره
      });

      res.status(201).json({
        message: "تم إنشاء حساب المدير بنجاح",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          name: adminUser.name
        }
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      res.status(500).json({
        message: "حدث خطأ أثناء إنشاء حساب المدير",
        error: error.message
      });
    }
  });

  // Staff credentials management
  app.post("/api/staff/credentials", async (req, res) => {
    try {
      const { username, password, staffId, name } = req.body;

      // التحقق من وجود المستخدم
      const existingStaff = await storage.getUserByUsername(username);
      if (existingStaff) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      // إنشاء مستخدم جديد بصلاحيات الموظف
      const hashedPassword = await hashPassword(password);
      const staffUser = await storage.createUser({
        username,
        password: hashedPassword,
        role: "staff",
        staffId: staffId || null,
        name: name || null, // إضافة الاسم إذا تم توفيره
      });

      res.status(201).json({
        message: "تم إنشاء حساب الموظف بنجاح",
        user: {
          id: staffUser.id,
          username: staffUser.username,
          role: staffUser.role,
          staffId: staffUser.staffId,
          name: staffUser.name
        }
      });
    } catch (error: any) {
      console.error('Error creating staff:', error);
      res.status(500).json({
        message: "حدث خطأ أثناء إنشاء حساب الموظف",
        error: error.message
      });
    }
  });

  app.get("/api/appointments/today", async (_req, res) => {
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
  });

  app.get("/api/products/low-stock", async (_req, res) => {
    const products = await storage.getProducts();
    const lowStock = products.filter(product => Number(product.quantity) < 10);

    // Get group details for each product
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
  });

  // إضافة API للإحصائيات السريعة للموظفين
  app.get("/api/staff/quick-stats", async (_req, res) => {
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
  });

  // Delete user account
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      await storage.deleteUser(userId);
      res.status(200).json({ message: "تم حذف الحساب بنجاح" });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "حدث خطأ أثناء حذف الحساب" });
    }
  });

  // Get all users
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        staffId: user.staffId,
        createdAt: user.createdAt
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب قائمة المستخدمين" });
    }
  });


  // جلب كل الصلاحيات
  app.get("/api/permissions", async (_req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الصلاحيات" });
    }
  });

  // جلب صلاحيات مستخدم محدد
  app.get("/api/users/:userId/permissions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userPermissions = await storage.getUserPermissions(userId);
      res.json(userPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب صلاحيات المستخدم" });
    }
  });

  // تحديث صلاحية مستخدم
  app.put("/api/users/:userId/permissions/:permissionId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const permissionId = parseInt(req.params.permissionId);
      const { granted } = req.body;

      // التحقق من وجود المستخدم
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // التحقق من وجود الصلاحية
      const permission = await storage.getPermission(permissionId);
      if (!permission) {
        return res.status(404).json({ error: "الصلاحية غير موجودة" });
      }

      // تحديث الصلاحية
      await storage.updateUserPermission(userId, permissionId, granted);
      res.json({ message: "تم تحديث الصلاحية بنجاح" });
    } catch (error) {
      console.error('Error updating user permission:', error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الصلاحية" });
    }
  });

  app.get("/api/inventory/stats", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      const lowStockProducts = products.filter(product => Number(product.quantity) < 10);

      // Get today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const invoices = await storage.getInvoices();
      const todaysSales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= today;
      });

      const stats = {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        dailySales: todaysSales.length,
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب إحصائيات المخزون" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}