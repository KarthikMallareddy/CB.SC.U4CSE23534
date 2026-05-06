import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { log } from '../middleware/logger';

const router = Router();

// Log every incoming request to this router
router.use(async (req, _res, next) => {
  await log('debug', 'route', `Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * GET /api/v1/notifications
 * Query params: page, limit, notification_type
 */
router.get('/', getNotifications);

/**
 * POST /api/v1/notifications/read-all
 * Must be defined BEFORE /:id/read to avoid route conflict
 */
router.post('/read-all', markAllAsRead);

/**
 * PATCH /api/v1/notifications/:id/read
 */
router.patch('/:id/read', markAsRead);

export default router;
