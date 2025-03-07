
import { createServer } from "vite";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// إنشاء وسيطة Vite للتطوير
export async function createViteDevMiddleware(app: express.Application) {
  const vite = await createServer({
    server: {
      middlewareMode: true,
    },
    root: "./client",
    appType: "spa",
  });

  // استخدام خادم Vite كوسيطة
  app.use(vite.middlewares);

  // وسيطة للوظائف المختصة بقناة WebSocket
  app.use(
    "/",
    createProxyMiddleware({
      target: "http://localhost:5174",
      changeOrigin: true,
      ws: true,
    })
  );

  return vite;
}
