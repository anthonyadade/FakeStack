import express, { Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import {
  AddNotificationRequest,
  FakeSOSocket,
  Notification,
  NotificationByIdRequest,
  NotificationByUserRequest,
} from '../types/types';
import {
  getNotificationById,
  getNotificationsByUser,
  saveNotification,
  updateNotification,
} from '../services/notification.service';

const notificationController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Function for checking if an AddNotificationRequest body is valid.
   * @param req An AddNotificationRequest to check the body of.
   * @returns True if the body is valid, otherwise false.
   */
  const isNotiBodyValid = (req: AddNotificationRequest): boolean =>
    req.body !== undefined &&
    req.body.notificationToAdd !== undefined &&
    req.body.notificationToAdd.notiTo !== undefined &&
    req.body.notificationToAdd.notiTo.trim() !== '' &&
    req.body.notificationToAdd.notiSource !== undefined &&
    req.body.notificationToAdd.notiSource.trim() !== '' &&
    req.body.notificationToAdd.type !== undefined &&
    ['message', 'answer', 'comment'].includes(req.body.notificationToAdd.type) &&
    req.body.notificationToAdd.preview !== undefined &&
    req.body.notificationToAdd.preview.trim() !== '' &&
    req.body.notificationToAdd.notiFrom !== undefined &&
    req.body.notificationToAdd.notiFrom.trim() !== '';

  /**
   * Adds a new notification to the database.
   *
   * @param req The AddNotificationRequest object to add.
   * @param res The HTTP response object used to send back the result of the operation.
   * @returns A Promise that resolves to void.
   */
  const addNotification = async (req: AddNotificationRequest, res: Response): Promise<void> => {
    if (!isNotiBodyValid(req)) {
      res.status(400).send('Invalid notification body');
      return;
    }

    // Get the notification to add from the request.
    const requestNotification = req.body.notificationToAdd;

    // Build a new notification based on the request.
    const notification: Notification = {
      ...requestNotification,
      notiDateTime: new Date(),
      read: false,
    };

    // Create the requested notification.
    try {
      const result = await saveNotification(notification);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('notificationCreate', {
        notification: result,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving notification: ${error}`);
    }
  };

  /**
   * Gets all notifications for a user.
   *
   * @param req The NotificationByUserRequest object containing a username.
   * @param res The HTTP response object used to send back the result of the operation.
   * @returns A Promise that resolves to void.
   */
  const getNotisByUser = async (req: NotificationByUserRequest, res: Response): Promise<void> => {
    try {
      const notifications = await getNotificationsByUser(req.params.username);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).send(`Error when fetching user's notifications: ${error}`);
    }
  };

  /**
   * Gets a notification from the database based on its ID.
   *
   * @param req The NotificationByIdRequest object containing the notification ID.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const getNotification = async (req: NotificationByIdRequest, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;

      const notification = await getNotificationById(notificationId);

      if ('error' in notification) {
        throw Error(notification.error);
      }

      res.status(200).json(notification);
    } catch (error) {
      res.status(500).send(`Error when getting user by notification: ${error}`);
    }
  };

  /**
   * Mark a notification as read.
   *
   * @param req The NotificationByIdRequest containing the notification ID as a route parameter.
   * @param res The HTTP response object used to send back the result of the operation.
   * @returns A Promise that resolves to void.
   */
  const markNotificationRead = async (
    req: NotificationByIdRequest,
    res: Response,
  ): Promise<void> => {
    try {
      // Fetch the specified notification.
      const { notificationId } = req.params;

      if (!ObjectId.isValid(notificationId)) {
        res.status(400).send('Invalid ID format');
        return;
      }

      // Update the read field of the notification.
      const updatedNotification = await updateNotification(notificationId, { read: true });

      if ('error' in updatedNotification) {
        throw Error(updatedNotification.error);
      }

      socket.emit('notificationUpdate', {
        notification: updatedNotification,
      });
      res.status(200).json(updatedNotification);
    } catch (error) {
      res.status(500).send(`Error when updating notification read status: ${error}`);
    }
  };

  /**
   * Mark all notifications for a user as read.
   *
   * @param req The request containing the user's username as a route parameter.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const markAllNotificationsRead = async (
    req: NotificationByUserRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { username } = req.params;
      const notifications = await getNotificationsByUser(username);
      if ('error' in notifications) {
        throw Error(notifications.error);
      }

      const updatedNotifications = await Promise.all(
        notifications.map(notif => updateNotification(String(notif._id), { read: true })),
      );

      updatedNotifications.map(un => {
        if ('error' in un) throw Error(un.error);
        return un;
      });

      res.status(200).json(updatedNotifications);
    } catch (error) {
      res.status(500).send(`Error when marking user's notifications as read: ${error}`);
    }
  };

  // API Endpoints
  router.post('/addNotification', addNotification); // create and add a new notification to the database
  router.get('/getNotification/:notificationId', getNotification); // get a specific noti
  router.get('/getNotisByUser/:username', getNotisByUser); // get all notis specific to a user
  router.patch('/markNotiRead/:notificationId', markNotificationRead); // mark a noti as read
  router.patch('/markAllNotisRead/:username', markAllNotificationsRead); // mark all notis read for a user

  return router;
};

export default notificationController;
