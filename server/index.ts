import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupViteServer } from './vite.js';
import { setupRoutes } from './routes.js';
import { testConnection } from './db.js';
import { storage } from './storage.js';

async function main() {
  // تجهيز تطبيق Express
  const app = express();

  // تكوين CORS وإعدادات JSON
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  console.log("🚀 بدء تشغيل الخادم...");

  // اختبار الاتصال بقاعدة البيانات
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error("❌ فشل الاتصال بقاعدة البيانات، سيتم محاولة إنشاء الجداول عند الطلب لاحقًا");
  }

  // إعداد طرق API
  await setupRoutes(app);
  console.log("✅ تم تسجيل طرق API بنجاح");

  // إنشاء وضمان وجود جداول قاعدة البيانات
  await storage.ensureTablesExist()
    .then(success => {
      if (success) {
        console.log("✅ تم التحقق من الجداول وإنشائها بنجاح");
      } else {
        console.error("❌ حدث خطأ أثناء إنشاء الجداول");
      }
    });

  // استخدام منفذ 8080 لتجنب أي تعارض
  const port = process.env.PORT || 8080;

  // إنشاء خادم HTTP
  const server = createServer(app);

  // إعداد خادم Vite للواجهة الأمامية
  try {
    await setupViteServer(app, server);
    console.log("✅ تم إعداد خادم Vite بنجاح");
  } catch (error) {
    console.error("❌ فشل في إعداد خادم Vite:", error);
  }

  // إيقاف أي عمليات سابقة على نفس المنفذ (إجراء بديل)
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ المنفذ ${port} قيد الاستخدام بالفعل، جاري المحاولة على منفذ آخر...`);
      setTimeout(() => {
        server.close();
        server.listen(port + 1, '0.0.0.0');
      }, 1000);
    } else {
      console.error(`❌ خطأ في الخادم:`, error);
    }
  });

  // اختبار إذا كان المنفذ قيد الاستخدام
  import { createServer as createNetServer } from 'net';

  const testPort = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const testServer = createNetServer()
        .once('error', () => {
          // المنفذ قيد الاستخدام بالفعل
          resolve(false);
        })
        .once('listening', () => {
          // المنفذ متاح
          testServer.close(() => resolve(true));
        })
        .listen(port, '0.0.0.0');
    });
  };

  // بدء الاستماع على المنفذ المتاح
  testPort(port).then((isAvailable) => {
    const chosenPort = isAvailable ? port : port + 1000;

    // بدء الاستماع على المنفذ المتاح
    server.listen(chosenPort, '0.0.0.0', () => {
      if (!isAvailable) {
        console.log(`⚠️ المنفذ ${port} قيد الاستخدام، تم الانتقال إلى المنفذ ${chosenPort}`);
      }

      console.log(`✅ الخادم يعمل على المنفذ ${chosenPort}`);
      console.log(`📱 يمكنك الوصول إلى التطبيق من خلال: http://0.0.0.0:${chosenPort}/`);

      // إعداد WebSocket
      const WebSocket = require('ws');
      const wss = new WebSocket.Server({ server });

      wss.on('connection', (ws) => {
        console.log('✅ اتصال WebSocket جديد');

        // إرسال رسالة ترحيب عند الاتصال
        ws.send(JSON.stringify({ type: 'connection', message: 'مرحبًا بك في نظام إدارة الأعمال' }));

        // استماع للرسائل الواردة
        ws.on('message', (message) => {
          console.log('📩 رسالة واردة:', message.toString());
          try {
            const parsedMessage = JSON.parse(message.toString());

            // معالجة الرسالة حسب النوع
            if (parsedMessage.type === 'refresh') {
              // إعادة تحميل البيانات وإرسالها للعميل
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: 'refresh', timestamp: new Date().toISOString() }));
                }
              });
            }
          } catch (error) {
            console.error('❌ خطأ في معالجة رسالة WebSocket:', error);
          }
        });

        // معالجة إغلاق الاتصال
        ws.on('close', () => {
          console.log('❌ تم إغلاق اتصال WebSocket');
        });

        // معالجة الأخطاء
        ws.on('error', (error) => {
          console.error('❌ خطأ في اتصال WebSocket:', error);
        });
      });

      // إرسال إشعارات بتحديث البيانات لجميع العملاء
      const notifyClients = (type, data) => {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
          }
        });
      };

      // تصدير وظيفة الإشعار للاستخدام في وحدات أخرى
      global.notifyClients = notifyClients;
    });
  });

  // معالجة الأخطاء غير المتوقعة
  process.on('uncaughtException', (error) => {
    console.error('❌ خطأ غير متوقع:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ وعد غير معالج:', reason);
  });
}

// تشغيل الخادم
main().catch((error) => {
  console.error("❌ خطأ أثناء بدء تشغيل الخادم:", error);
  process.exit(1);
});