import { Request, Response } from 'express';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  isRead,
} from '../services/notificationService';
import { log } from '../middleware/logger';

/**
 * GET /api/v1/notifications
 * Retrieves a paginated, filterable list of notifications from the evaluation service.
 * Augments each notification with an `isRead` flag from the in-memory store.
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  await log('info', 'handler', `GET /api/v1/notifications - query: ${JSON.stringify(req.query)}`);

  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const notification_type = req.query.notification_type as string | undefined;

    if (isNaN(page) || page < 1) {
      await log('warn', 'handler', `Invalid page parameter: ${req.query.page}`);
      res.status(400).json({ error: 'Invalid page parameter. Must be a positive integer.' });
      return;
    }

    if (isNaN(limit) || limit < 5 || limit > 10) {
      await log('warn', 'handler', `Invalid limit parameter: ${req.query.limit}`);
      res.status(400).json({ error: 'Invalid limit parameter. Must be between 5 and 10.' });
      return;
    }

    const notifications = await fetchNotifications({ page, limit, notification_type });

    // Augment with read status from the in-memory store
    const augmented = notifications.map((n) => ({
      ...n,
      isRead: isRead(n.ID),
    }));

    await log('debug', 'handler', `Returning ${augmented.length} notifications to client`);

    res.status(200).json({
      data: augmented,
      pagination: { page, limit, count: augmented.length },
    });
  } catch (error: any) {
    console.error('getNotifications error:', error.message);
    await log('error', 'handler', `Failed to fetch notifications: ${error.message}`);
    res.status(500).json({ error: 'Internal server error while fetching notifications.' });
  }
}

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await log('info', 'handler', `PATCH /api/v1/notifications/${id}/read`);

  try {
    if (!id || typeof id !== 'string') {
      await log('warn', 'handler', 'markAsRead called without a valid notification ID');
      res.status(400).json({ error: 'Notification ID is required.' });
      return;
    }

    // Fetch a broad list to verify the notification exists
    const notifications = await fetchNotifications({ limit: 10, page: 1 });
    const success = await markNotificationRead(id, notifications);

    if (!success) {
      await log('warn', 'handler', `Notification not found: ${id}`);
      res.status(404).json({ error: `Notification with ID ${id} not found.` });
      return;
    }

    await log('info', 'handler', `Successfully marked notification ${id} as read`);
    res.status(200).json({ message: 'Notification marked as read successfully' });
  } catch (error: any) {
    console.error('markAsRead error:', error.message);
    await log('error', 'handler', `Failed to mark notification as read: ${error.message}`);
    res.status(500).json({ error: 'Internal server error while marking notification as read.' });
  }
}

/**
 * POST /api/v1/notifications/read-all
 * Marks all current notifications as read.
 */
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  await log('info', 'handler', 'POST /api/v1/notifications/read-all');

  try {
    const notifications = await fetchNotifications({ limit: 10, page: 1 });
    const count = await markAllNotificationsRead(notifications);

    await log('info', 'handler', `Bulk read operation complete. Marked ${count} notifications as read.`);
    res.status(200).json({ message: `All notifications marked as read`, count });
  } catch (error: any) {
    console.error('markAllAsRead error:', error.message);
    await log('error', 'handler', `Failed to mark all notifications as read: ${error.message}`);
    res.status(500).json({ error: 'Internal server error while marking all notifications as read.' });
  }
}
