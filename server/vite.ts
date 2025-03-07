
import { ViteDevServer, createServer } from 'vite';
import { Express } from 'express';
import path from 'path';

export async function createViteDevServer(app: Express): Promise<ViteDevServer> {
  console.info('Setting up Vite proxy middleware for development');
  
  const vite = await createServer({
    root: path.resolve(process.cwd(), 'client'),
    server: {
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
    appType: 'spa',
  });

  // استخدام Vite middleware
  app.use(vite.middlewares);

  return vite;
}
