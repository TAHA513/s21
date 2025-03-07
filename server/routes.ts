
import { Express } from 'express';
import { storage } from './storage.js';

// إعداد مسارات API
export async function setupRoutes(app: Express) {
  // مسار الصفحة الرئيسية أو اختبار API
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'مرحبا بك في واجهة برمجة التطبيقات',
      status: 'success',
      timestamp: new Date().toISOString()
    });
  });

  // ======= مسارات المنتجات =======

  // الحصول على جميع المنتجات
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json({
        status: 'success',
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء جلب المنتجات',
        error: error.message
      });
    }
  });

  // الحصول على منتج بواسطة المعرف
  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error',
          message: 'معرف المنتج غير صالح'
        });
      }
      
      const product = await storage.getProductById(id);

      if (!product) {
        return res.status(404).json({ 
          status: 'error',
          message: 'لم يتم العثور على المنتج'
        });
      }

      res.json({
        status: 'success',
        data: product
      });
    } catch (error) {
      console.error('خطأ في جلب المنتج:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء جلب المنتج',
        error: error.message
      });
    }
  });

  // إنشاء منتج جديد
  app.post('/api/products', async (req, res) => {
    try {
      const productData = req.body;

      // التحقق من البيانات المطلوبة
      if (!productData.name || !productData.cost_price || !productData.selling_price) {
        return res.status(400).json({ 
          status: 'error',
          message: 'الرجاء توفير جميع البيانات المطلوبة للمنتج (الاسم، سعر التكلفة، سعر البيع)'
        });
      }

      const newProduct = await storage.addProduct(productData);
      
      if (!newProduct) {
        return res.status(500).json({ 
          status: 'error',
          message: 'فشل في إنشاء المنتج'
        });
      }
      
      res.status(201).json({
        status: 'success',
        message: 'تم إنشاء المنتج بنجاح',
        data: newProduct
      });
    } catch (error) {
      console.error('خطأ في إنشاء منتج:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء إنشاء منتج جديد',
        error: error.message
      });
    }
  });

  // تحديث منتج
  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error',
          message: 'معرف المنتج غير صالح'
        });
      }
      
      const productData = req.body;

      // التحقق من البيانات المطلوبة
      if (!productData.name || !productData.cost_price || !productData.selling_price) {
        return res.status(400).json({ 
          status: 'error',
          message: 'الرجاء توفير جميع البيانات المطلوبة للمنتج (الاسم، سعر التكلفة، سعر البيع)'
        });
      }

      const updatedProduct = await storage.updateProduct(id, productData);

      if (!updatedProduct) {
        return res.status(404).json({ 
          status: 'error',
          message: 'لم يتم العثور على المنتج'
        });
      }

      res.json({
        status: 'success',
        message: 'تم تحديث المنتج بنجاح',
        data: updatedProduct
      });
    } catch (error) {
      console.error('خطأ في تحديث منتج:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء تحديث المنتج',
        error: error.message
      });
    }
  });

  // حذف منتج
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'error',
          message: 'معرف المنتج غير صالح'
        });
      }
      
      const success = await storage.deleteProduct(id);

      if (!success) {
        return res.status(404).json({ 
          status: 'error',
          message: 'لم يتم العثور على المنتج'
        });
      }

      res.json({ 
        status: 'success',
        message: 'تم حذف المنتج بنجاح'
      });
    } catch (error) {
      console.error('خطأ في حذف منتج:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء حذف المنتج',
        error: error.message
      });
    }
  });

  // ======= مسارات فئات المنتجات =======
  
  // الحصول على جميع الفئات
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json({
        status: 'success',
        count: categories.length,
        data: categories
      });
    } catch (error) {
      console.error('خطأ في جلب فئات المنتجات:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء جلب فئات المنتجات',
        error: error.message
      });
    }
  });

  // ======= مسارات العملاء =======

  // الحصول على جميع العملاء
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json({
        status: 'success',
        count: customers.length,
        data: customers
      });
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء جلب العملاء',
        error: error.message
      });
    }
  });
  
  // إضافة عميل جديد
  app.post('/api/customers', async (req, res) => {
    try {
      const customerData = req.body;
      
      // التحقق من البيانات المطلوبة
      if (!customerData.name) {
        return res.status(400).json({ 
          status: 'error',
          message: 'الرجاء توفير اسم العميل على الأقل'
        });
      }
      
      const newCustomer = await storage.addCustomer(customerData);
      
      if (!newCustomer) {
        return res.status(500).json({ 
          status: 'error',
          message: 'فشل في إضافة العميل'
        });
      }
      
      res.status(201).json({
        status: 'success',
        message: 'تم إضافة العميل بنجاح',
        data: newCustomer
      });
    } catch (error) {
      console.error('خطأ في إضافة عميل:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء إضافة عميل جديد',
        error: error.message
      });
    }
  });

  // ======= مسارات الفواتير =======
  
  // الحصول على جميع الفواتير
  app.get('/api/invoices', async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json({
        status: 'success',
        count: invoices.length,
        data: invoices
      });
    } catch (error) {
      console.error('خطأ في جلب الفواتير:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء جلب الفواتير',
        error: error.message
      });
    }
  });
  
  // إنشاء فاتورة جديدة
  app.post('/api/invoices', async (req, res) => {
    try {
      const { invoice, items } = req.body;
      
      // التحقق من البيانات المطلوبة
      if (!invoice || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          status: 'error',
          message: 'الرجاء توفير بيانات الفاتورة وعناصرها بشكل صحيح'
        });
      }
      
      if (!invoice.customer_name || !invoice.subtotal || !invoice.final_total) {
        return res.status(400).json({ 
          status: 'error',
          message: 'الرجاء توفير اسم العميل والإجمالي الفرعي والإجمالي النهائي للفاتورة'
        });
      }
      
      const newInvoice = await storage.createInvoice(invoice, items);
      
      if (!newInvoice) {
        return res.status(500).json({ 
          status: 'error',
          message: 'فشل في إنشاء الفاتورة'
        });
      }
      
      res.status(201).json({
        status: 'success',
        message: 'تم إنشاء الفاتورة بنجاح',
        data: {
          invoice: newInvoice,
          items: items
        }
      });
    } catch (error) {
      console.error('خطأ في إنشاء فاتورة:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'حدث خطأ أثناء إنشاء فاتورة جديدة',
        error: error.message
      });
    }
  });

  console.log("✅ تم تسجيل جميع المسارات بنجاح");
}
