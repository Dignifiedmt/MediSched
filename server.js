import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db.js';
import { authRouter } from './server/routes/auth.js';
import { doctorsRouter } from './server/routes/doctors.js';
import { appointmentsRouter } from './server/routes/appointments.js';
import { adminRouter } from './server/routes/admin.js';

async function startServer() {
  // Initialize SQLite tables and seed data
  initDatabase();

  const app = express();

  // Detect environment: In AI Studio development container, bind to 3000.
  // On deployment platforms (Railway, Render, Fly.io, Cloud Run, Docker) with PORT set, use process.env.PORT.
  const isAiStudioDev = process.env.NODE_ENV === 'development' && !process.env.RAILWAY_ENVIRONMENT && !process.env.RENDER;
  const PORT = (!isAiStudioDev && process.env.PORT)
    ? parseInt(process.env.PORT, 10)
    : 3000;

  app.use(express.json());

  // Health check endpoint for Railway, Render, Fly.io, etc.
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MediSched NG API',
      timestamp: new Date().toISOString(),
      city: 'Kaduna, Nigeria',
      port: PORT,
      env: process.env.NODE_ENV || 'development'
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/doctors', doctorsRouter);
  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/admin', adminRouter);

  // Development vs Production serving
  const distPath = path.resolve(process.cwd(), 'dist');
  const distIndexExists = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || 
    Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.FLY_ALLOC_ID) ||
    distIndexExists && isAiStudioDev === false;

  if (isProduction && distIndexExists) {
    console.log(`[MediSched NG] Serving production static bundle from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[MediSched NG] Starting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('[MediSched NG] Request error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: err?.message || 'Unknown error'
      });
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediSched NG] Server successfully started and listening on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });

  // Graceful shutdown handling for container platforms
  const handleShutdown = (signal) => {
    console.log(`[MediSched NG] Received ${signal}, gracefully shutting down...`);
    server.close(() => {
      console.log('[MediSched NG] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  return server;
}

startServer().catch((err) => {
  console.error('[MediSched NG] Failed to start server:', err);
  process.exit(1);
});
