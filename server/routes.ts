import { Express } from 'express';
import { storage } from './storage.js';

// إعداد مسارات API
export async function setupRoutes(app: Express) {
  // مسار الصفحة الرئيسية أو اختبار API
  app.get('/api', (req, res) => {
    res.json({ message: 'مرحبا بك في واجهة برمجة التطبيقات' });
  });

  // ======= مسارات المنتجات =======

  // الحصول على جميع المنتجات
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتجات' });
    }
  });

  // الحصول على منتج بواسطة المعرف
  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: 'لم يتم العثور على المنتج' });
      }

      res.json(product);
    } catch (error) {
      console.error('خطأ في جلب المنتج:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتج' });
    }
  });

  // إنشاء منتج جديد
  app.post('/api/products', async (req, res) => {
    try {
      const productData = req.body;

      // التحقق من البيانات المطلوبة
      if (!productData.name || !productData.cost_price || !productData.selling_price) {
        return res.status(400).json({ error: 'الرجاء توفير جميع البيانات المطلوبة للمنتج' });
      }

      const newProduct = await storage.addProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('خطأ في إنشاء منتج:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء منتج جديد' });
    }
  });

  // تحديث منتج
  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = req.body;

      // التحقق من البيانات المطلوبة
      if (!productData.name || !productData.cost_price || !productData.selling_price) {
        return res.status(400).json({ error: 'الرجاء توفير جميع البيانات المطلوبة للمنتج' });
      }

      const updatedProduct = await storage.updateProduct(id, productData);

      if (!updatedProduct) {
        return res.status(404).json({ error: 'لم يتم العثور على المنتج' });
      }

      res.json(updatedProduct);
    } catch (error) {
      console.error('خطأ في تحديث منتج:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء تحديث المنتج' });
    }
  });

  // حذف منتج
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);

      if (!success) {
        return res.status(404).json({ error: 'لم يتم العثور على المنتج' });
      }

      res.json({ message: 'تم حذف المنتج بنجاح' });
    } catch (error) {
      console.error('خطأ في حذف منتج:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء حذف المنتج' });
    }
  });

  // ======= مسارات العملاء =======

  // الحصول على جميع العملاء
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب العملاء' });
    }
  });

  // ======= مسارات المبيعات =======

  // إنشاء عملية بيع جديدة
  app.post('/api/sales', async (req, res) => {
    try {
      const { sale, items } = req.body;

      // التحقق من البيانات المطلوبة
      if (!sale || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'الرجاء توفير بيانات البيع وعناصره بشكل صحيح' });
      }

      const result = await storage.addSale(sale, items);

      if (!result) {
        return res.status(500).json({ error: 'فشل في إنشاء عملية البيع' });
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('خطأ في إنشاء عملية بيع:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء عملية بيع جديدة' });
    }
  });

  console.log('تم إعداد مسارات API بنجاح');
}