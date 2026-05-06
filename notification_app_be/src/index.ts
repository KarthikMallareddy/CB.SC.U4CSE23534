import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initLogger, log } from './middleware/logger';
import notificationRoutes from './routes/notifications';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(async (req: Request, _res: Response, next: NextFunction) => {
  await log('debug', 'middleware', `[${req.method}] ${req.path} from ${req.ip}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Notification API
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler
app.use(async (req: Request, res: Response) => {
  await log('warn', 'middleware', `404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler
app.use(async (err: Error, req: Request, res: Response, _next: NextFunction) => {
  await log('fatal', 'middleware', `Unhandled exception on ${req.method} ${req.path}: ${err.message}`);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    // Initialise the logging middleware first (authenticates with evaluation service)
    await initLogger();

    app.listen(config.port, () => {
      console.log(`✅ Server running on http://localhost:${config.port}`);
      console.log(`   Health:        GET  /health`);
      console.log(`   Notifications: GET  /api/v1/notifications`);
      console.log(`   Mark Read:     PATCH /api/v1/notifications/:id/read`);
      console.log(`   Mark All:      POST /api/v1/notifications/read-all`);
    });

    await log('info', 'config', `Server started on port ${config.port}`);
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();

export default app;
