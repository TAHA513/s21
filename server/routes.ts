import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import path from 'path';
import { db } from './db';

// إعداد multer لتحميل الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// تسجيل المسارات
export async function registerRoutes(app: Express): Promise<Server> {
  // إنشاء خادم HTTP
  const server = createServer(app);

  // إضافة مسارات API
  const apiRouter = express.Router();

  // مسار الاختبار
  apiRouter.get('/test', (req, res) => {
    res.json({ message: 'تم الاتصال بنجاح بواجهة API!' });
  });

  // مسار تسجيل الدخول
  apiRouter.post('/login', (req, res, next) => {
    // هنا يمكنك إضافة منطق تسجيل الدخول
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  });

  // مسار لإعدادات قاعدة البيانات
  apiRouter.get('/database-settings', (req, res) => {
    // تحقق مما إذا كان المستخدم مصرح له
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'غير مصرح به' });
    }

    // إرسال إعدادات قاعدة البيانات (بدون بيانات حساسة)
    res.json({
      connected: true,
      databaseType: 'PostgreSQL',
      host: 'مخفي لأسباب أمنية',
    });
  });

  // مسار لتحميل الملفات
  apiRouter.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم تحميل أي ملف' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      path: req.file.path
    });
  });

  // تسجيل مسارات API
  app.use('/api', apiRouter);

  return server;
}