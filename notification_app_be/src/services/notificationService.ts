import axios from 'axios';
import { config } from '../config/env';
import { getToken } from '../config/tokenStore';
import { log } from '../middleware/logger';

/**
 * Notification shape returned by the evaluation service.
 */
export interface EvaluationNotification {
  ID: string;
  Type: 'Event' | 'Result' | 'Placement';
  Message: string;
  Timestamp: string;
}

/**
 * In-memory store tracking which notification IDs have been marked as read.
 * In a production system, this would be persisted in PostgreSQL (Stage 2 design).
 */
const readNotificationIds = new Set<string>();

/**
 * Fetches notifications from the evaluation service.
 */
export async function fetchNotifications(params: {
  page?: number;
  limit?: number;
  notification_type?: string;
}): Promise<EvaluationNotification[]> {
  const token = getToken();

  await log('debug', 'service', `Fetching notifications - params: ${JSON.stringify(params)}`);

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.notification_type) queryParams.append('notification_type', params.notification_type);

  const url = `${config.evaluationService.baseUrl}/notifications?${queryParams.toString()}`;

  const response = await axios.get<{ notifications: EvaluationNotification[] }>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const notifications = response.data.notifications || [];
  await log('info', 'service', `Fetched ${notifications.length} notifications from evaluation service`);
  return notifications;
}

/**
 * Marks a single notification as read. Returns false if ID not found.
 */
export async function markNotificationRead(
  id: string,
  allNotifications: EvaluationNotification[]
): Promise<boolean> {
  const exists = allNotifications.some((n) => n.ID === id);
  if (!exists) {
    await log('warn', 'service', `Notification not found for mark-read: ${id}`);
    return false;
  }
  readNotificationIds.add(id);
  await log('info', 'service', `Notification ${id} marked as read`);
  return true;
}

/**
 * Marks all notifications in the provided list as read.
 */
export async function markAllNotificationsRead(
  notifications: EvaluationNotification[]
): Promise<number> {
  let count = 0;
  for (const notif of notifications) {
    if (!readNotificationIds.has(notif.ID)) {
      readNotificationIds.add(notif.ID);
      count++;
    }
  }
  await log('info', 'service', `Bulk mark-read: ${count} notifications updated`);
  return count;
}

/** Returns whether a notification ID has been marked as read. */
export function isRead(id: string): boolean {
  return readNotificationIds.has(id);
}
