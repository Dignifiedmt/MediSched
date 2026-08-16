import 'dotenv/config';
import express from 'express';
import path from 'path';
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
  const PORT = 3000;

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
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

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
