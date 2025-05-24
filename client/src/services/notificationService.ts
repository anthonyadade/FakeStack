import api from './config';
import { DatabaseNotification, Notification } from '../types/types';

const NOTIFICATION_API_URL = `${process.env.REACT_APP_SERVER_URL}/notification`;

/**
 * Interface for the request body when adding a notification.
 * We omit the "read" property assuming it defaults to false on the backend.
 */
interface AddNotificationRequestBody {
  notificationToAdd: Omit<Notification, 'read'>;
}

/**
 * Adds a new notification.
 *
 * @param notificationToAdd - The notification object to add.
 * @throws an error if the request fails or the response status is not 200.
 */
const addNotification = async (
  notificationToAdd: Omit<Notification, 'read'>,
): Promise<DatabaseNotification> => {
  const reqBody: AddNotificationRequestBody = { notificationToAdd };
  const res = await api.post(`${NOTIFICATION_API_URL}/addNotification`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while adding a new notification');
  }
  return res.data;
};

/**
 * Fetches notifications for a given user.
 *
 * @param username - The username of the user whose notifications to fetch.
 * @throws an error if the request fails.
 */
const getNotificationsByUser = async (username: string): Promise<DatabaseNotification[]> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/getNotisByUser/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching notifications for the given user');
  }
  return res.data;
};

/**
 * Updates a notification with the given ID.
 *
 * @param notificationId - The ID of the notification to update.
 * @param updateData - An object containing the fields to update (for example, { read: true }).
 * @throws an error if the request fails or the response status is not 200.
 */
const markNotificationRead = async (notificationId: string): Promise<DatabaseNotification> => {
  const res = await api.patch(`${NOTIFICATION_API_URL}/markNotiRead/${notificationId}`);
  if (res.status !== 200) {
    throw new Error('Error marking notification as read');
  }
  return res.data;
};

/**
 * Mark all notifications as read for a user.
 *
 * @param username - The username of the user to mark notifications as read for.
 * @returns an error if the request fails.
 */
const markAllNotificationsRead = async (username: string): Promise<void> => {
  const res = await api.patch(`${NOTIFICATION_API_URL}/markAllNotisRead/${username}`);
  if (res.status !== 200) {
    throw new Error('Error marking notifications as read for user');
  }
  return res.data;
};

export { addNotification, getNotificationsByUser, markNotificationRead, markAllNotificationsRead };
