import { ObjectId } from 'mongodb';
import NotificationModel from '../models/notification.model';
import { DatabaseNotification, Notification, NotificationResponse } from '../types/types';

/**
 * Saves a new notification to the database.
 *
 * @param {Notification} notification - The notification object to be saved containing relevant details.
 * @returns {Promise<NotificationResponse>} - Resolves with the saved notification object or an error message.
 */
export const saveNotification = async (notification: Notification) => {
  try {
    const result = await NotificationModel.create(notification);

    if (!result) {
      throw Error('Failed to create notification');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving notification: ${error}` };
  }
};

/**
 * Gets a notification by its unique identifier.
 *
 * @param {string} id - The ID of the notification to get.
 * @returns {Promise<NotificationResponse>} - Resolves with the found notification object or an error message.
 */
export const getNotificationById = async (id: string) => {
  try {
    const notification: DatabaseNotification | null = await NotificationModel.findOne({
      _id: new ObjectId(id),
    });

    if (!notification) {
      throw Error('Notification not found');
    }

    return notification;
  } catch (error) {
    return { error: `Error occurred when finding notification: ${error}` };
  }
};

/**
 * Gets notifications for a user by username.
 *
 * @param {string} username - The username of the user to get notifications for.
 * @returns {Promise<NotificationsResponse>} - Resolves with the found notification objects or an error message.
 */
export const getNotificationsByUser = async (username: string) => {
  try {
    const notifications: DatabaseNotification[] = await NotificationModel.find({
      notiTo: username,
    });
    return notifications || [];
  } catch (error) {
    return { error: `Error occurred when finding notifications: ${error}` };
  }
};

/**
 * Updates a notification in the database based on its unique ID.
 *
 * @param {string} notificationId - The ID of the notification to update.
 * @param {Partial<Notification>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<NotificationResponse>} - Resolves with the updated notification object or an error message.
 */
export const updateNotification = async (
  notificationId: string,
  updates: Partial<Notification>,
): Promise<NotificationResponse> => {
  try {
    const updatedNotification: DatabaseNotification | null =
      await NotificationModel.findOneAndUpdate(
        { _id: notificationId },
        { $set: updates },
        { new: true },
      );
    if (!updatedNotification) {
      throw Error('Error updating notification');
    }

    return updatedNotification;
  } catch (error) {
    return { error: `Error occurred when updating notification: ${error}` };
  }
};
