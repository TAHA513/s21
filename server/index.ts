
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { db } from './db/connection';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// تحميل متغيرات البيئة
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// ضبط الوسائط
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// التحقق من الاتصال بقاعدة البيانات
app.get('/api/health', async (req, res) => {
  try {
    // التحقق من الاتصال بقاعدة البيانات
    await db.select().from(users).limit(1);
    res.status(200).json({ status: 'ok', message: 'تم الاتصال بقاعدة البيانات بنجاح' });
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    res.status(500).json({ status: 'error', message: 'فشل الاتصال بقاعدة البيانات' });
  }
});

// واجهة برمجة التطبيق للمستخدمين
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // التحقق من وجود المستخدم
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل' });
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // إنشاء المستخدم
    const newUser = await db.insert(users).values({
      name,
      email,
      phone,
      password: hashedPassword,
    }).returning();
    
    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', user: { id: newUser[0].id, name, email, phone } });
  } catch (error) {
    console.error('خطأ في تسجيل المستخدم:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل المستخدم' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // البحث عن المستخدم
    const userResults = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userResults.length === 0) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صالحة' });
    }
    
    const user = userResults[0];
    
    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صالحة' });
    }
    
    // إنشاء رمز JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// استخدام واجهة الويب
if (process.env.NODE_ENV === 'production') {
  // خدمة ملفات الواجهة المبنية في الإنتاج
  app.use(express.static(path.join(process.cwd(), 'dist/client')));
  
  // توجيه جميع الطلبات غير API إلى التطبيق
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api/')) {
      res.sendFile(path.join(process.cwd(), 'dist/client/index.html'));
    }
  });
} else {
  // في وضع التطوير، استخدم Vite
  import('./vite').then(({ createViteDevServer }) => {
    createViteDevServer(app);
  });
}

// بدء تشغيل الخادم
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});

export default app;
