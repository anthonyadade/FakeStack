import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a notification.
 * - `notiTo`: The user the notification is being received by.
 * - `notiSource`: The ID of the object responsible for the notification.
 * - `type`: Type of notification being received, either a message, answer, or comment.
 * - `preview`: A preview of the notification's content.
 * - `notiFrom`: The user responsible for the update triggering this notification
 * - `notiDateTime`: Timestamp of when notification was received.
 * - `read`: Represents whether notification has been read or not.
 */
export interface Notification {
  notiTo: string;
  notiSource: string;
  type: 'message' | 'answer' | 'comment';
  preview: string;
  notiFrom: string;
  notiDateTime: Date;
  read: boolean;
}

/**
 * Represents a notification stored in the database.
 * - `_id`: A unique identifier for the notifcation.
 * - `notiTo`: The user the notification is being received by.
 * - `notiSource`: The ID of the object responsible for the notification.
 * - `type`: Type of notification being received, either a message, answer, or comment.
 * - `preview`: A preview of the notification's content.
 * - `notiDateTime`: Timestamp of when notification was received.
 * - `read`: Represents whether notification has been read or not.
 */
export interface DatabaseNotification extends Notification {
  _id: ObjectId;
}

/**
 * Type representing possible responses for a notification-related operation.
 * - Either a `DatabaseNotification` object or an error message.
 */
export type NotificationResponse = DatabaseNotification | { error: string };

/**
 * Type representing possible responses for multiple notification-related operation.
 * - Either a `DatabaseNotification[]` list of objects or an error message.
 */
export type NotificationsResponse = DatabaseNotification[] | { error: string };

/**
 * Express request for creating a notification.
 * - `body`: Contains the `notificationToAdd` object, which includes the notification metadata.
 */
export interface AddNotificationRequest extends Request {
  body: {
    notificationToAdd: Notification;
  };
}

/**
 * Express request for getting a notification by its ID.
 * - `params`: Contains the `notificationId`, the unique identifier for the notification to find.
 */
export interface NotificationByIdRequest extends Request {
  params: {
    notificationId: string;
  };
}

/**
 * Express request for getting notifications by the target user.
 * - `params`: Contains a `username`, for who to get notifications for.
 */
export interface NotificationByUserRequest extends Request {
  params: {
    username: string;
  };
}
