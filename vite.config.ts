import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { defineConfig, Plugin } from 'vite';
import { apiRouter } from './api-handler';

function apiPlugin(): Plugin {
  return {
    name: 'api-server',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '10mb' }));
      app.use('/api', apiRouter);

      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api')) {
          (app as any)(req, res, next);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
