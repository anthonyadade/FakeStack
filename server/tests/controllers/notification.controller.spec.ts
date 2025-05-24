import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/notification.service';
import { DatabaseNotification, Notification } from '../../types/types';

const saveNotificationSpy = jest.spyOn(util, 'saveNotification');
const getNotificationByIDSpy = jest.spyOn(util, 'getNotificationById');
const getNotificationsByUserSpy = jest.spyOn(util, 'getNotificationsByUser');
const updateNotificationSpy = jest.spyOn(util, 'updateNotification');

describe('Notification Controller', () => {
  jest.setTimeout(30000);
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const requestNotification: Notification = {
    notiTo: 'user1',
    notiFrom: 'user2',
    notiSource: 'post123',
    type: 'comment',
    notiDateTime: new Date(),
    preview: 'this is the first notification',
    read: false,
  };

  const requestNotification2: Notification = {
    notiTo: 'user1',
    notiFrom: 'user2',
    notiSource: 'post123',
    type: 'message',
    preview: 'this is the second notificaiton',
    notiDateTime: new Date(),
    read: false,
  };

  const notificationResponse: DatabaseNotification = {
    ...requestNotification,
    _id: new mongoose.Types.ObjectId(),
  };

  const notificationWithID: DatabaseNotification = {
    ...requestNotification,
    _id: new mongoose.Types.ObjectId(),
  };

  describe('POST /addNotification', () => {
    it('should create a notification', async () => {
      saveNotificationSpy.mockResolvedValue(Object(notificationResponse));

      const response = await supertest(app)
        .post('/notification/addNotification')
        .send({ notificationToAdd: requestNotification });

      expect(response.status).toBe(200);
      expect(response.body.notiTo).toEqual(notificationResponse.notiTo);
      expect(response.body.notiDateTime).toEqual(notificationResponse.notiDateTime.toISOString());
    });

    it('should return 400 for invalid notification body', async () => {
      const invalidNotifications = [
        {},
        { notificationToAdd: {} },
        { notificationToAdd: { ...requestNotification, notiTo: '' } },
        { notificationToAdd: { ...requestNotification, notiSource: '' } },
        { notificationToAdd: { ...requestNotification, type: 'invalid' } },
        { notificationToAdd: { ...requestNotification, preview: '' } },
        { notificationToAdd: { ...requestNotification, notiFrom: '' } },
      ];

      const responses = await Promise.all(
        invalidNotifications.map(async body => {
          const response = await supertest(app).post('/notification/addNotification').send(body);
          expect(response.status).toBe(400);
          expect(response.text).toBe('Invalid notification body');
          return response;
        }),
      );

      responses.forEach(response => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Invalid notification body');
      });
    });

    it('should return 500 when service fails', async () => {
      saveNotificationSpy.mockResolvedValue({
        error: 'Database error',
      });

      const response = await supertest(app)
        .post('/notification/addNotification')
        .send({ notificationToAdd: requestNotification });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when saving notification');
    });
  });

  describe('GET /getNotification/:notificationId', () => {
    it('should return a notification by ID', async () => {
      getNotificationByIDSpy.mockResolvedValue(notificationResponse);

      const response = await supertest(app).get(
        `/notification/getNotification/${notificationWithID._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: notificationResponse._id.toString(),
        notiTo: notificationResponse.notiTo,
        notiFrom: notificationResponse.notiFrom,
        notiSource: notificationResponse.notiSource,
        type: notificationResponse.type,
        preview: notificationResponse.preview,
        notiDateTime: notificationResponse.notiDateTime.toISOString(),
        read: notificationResponse.read,
      });
    });

    it('should return 500 when service fails', async () => {
      getNotificationByIDSpy.mockResolvedValue({
        error: 'Not found',
      });

      const response = await supertest(app).get(
        `/notification/getNotification/${notificationWithID._id}`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when getting user by notification');
    });
  });

  describe('GET /getNotisByUser/:username', () => {
    const requestNotification3 = {
      notiTo: 'user1',
      notiFrom: 'user2',
      notiSource: 'post123',
      type: 'comment',
      preview: 'this is the third notificaiton',
      notiDateTime: new Date(),
      read: false,
    };

    const notificationWithID3: DatabaseNotification = {
      ...requestNotification3,
      _id: new mongoose.Types.ObjectId(),
      type: 'comment',
    };
    it('should return notifications for a user', async () => {
      getNotificationsByUserSpy.mockResolvedValue([notificationWithID, notificationWithID3]);

      const response = await supertest(app).get(
        `/notification/getNotisByUser/${notificationWithID.notiTo}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          _id: notificationWithID._id.toString(),
          notiTo: notificationWithID.notiTo,
          notiFrom: notificationWithID.notiFrom,
          notiSource: notificationWithID.notiSource,
          type: notificationWithID.type,
          preview: notificationWithID.preview,
          notiDateTime: notificationWithID.notiDateTime.toISOString(),
          read: notificationWithID.read,
        },
        {
          _id: notificationWithID3._id.toString(),
          notiTo: notificationWithID3.notiTo,
          notiFrom: notificationWithID3.notiFrom,
          notiSource: notificationWithID3.notiSource,
          type: notificationWithID3.type,
          preview: notificationWithID3.preview,
          notiDateTime: notificationWithID3.notiDateTime.toISOString(),
          read: notificationWithID3.read,
        },
      ]);
    });

    it('should return 500 when service fails', async () => {
      getNotificationsByUserSpy.mockRejectedValue(new Error('Database error'));

      const response = await supertest(app).get('/notification/getNotisByUser/user1');

      expect(response.status).toBe(500);
      expect(response.text).toContain("Error when fetching user's notifications");
    });
  });

  describe('PATCH /markNotiRead/:notificationId', () => {
    it('should mark a notification as read', async () => {
      const updatedNotification = {
        ...notificationResponse,
        read: true,
      } as DatabaseNotification;
      updateNotificationSpy.mockResolvedValue(updatedNotification);

      const response = await supertest(app).patch(
        `/notification/markNotiRead/${notificationResponse._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: updatedNotification._id.toString(),
        notiTo: updatedNotification.notiTo,
        notiFrom: updatedNotification.notiFrom,
        notiSource: updatedNotification.notiSource,
        type: updatedNotification.type,
        preview: updatedNotification.preview,
        notiDateTime: updatedNotification.notiDateTime.toISOString(),
        read: true,
      });
      expect(response.body.notiDateTime).toEqual(notificationResponse.notiDateTime.toISOString());
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = '2';
      const response = await supertest(app).patch(`/notification/markNotiRead/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid ID format');
    });

    it('should return 500 when service fails', async () => {
      updateNotificationSpy.mockResolvedValue({
        error: 'Update failed',
      });

      const response = await supertest(app).patch(
        `/notification/markNotiRead/${notificationResponse._id}`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when updating notification read status');
    });
  });

  describe('PATCH /markAllNotisRead/:username', () => {
    const notifications: DatabaseNotification[] = [
      { ...requestNotification, _id: new mongoose.Types.ObjectId(), read: true },
      { ...requestNotification2, _id: new mongoose.Types.ObjectId(), read: true },
    ];
    it('should mark all notifications as read for a user', async () => {
      getNotificationsByUserSpy.mockResolvedValue(notifications);

      for (const notif of notifications) {
        updateNotificationSpy.mockResolvedValue(notif);
      }

      const response = await supertest(app).patch(`/notification/markAllNotisRead/user1`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      // TODO: verify this
      expect(response.body).toEqual([
        {
          _id: notifications[1]._id.toString(),
          notiTo: notifications[1].notiTo,
          notiFrom: notifications[1].notiFrom,
          notiSource: notifications[1].notiSource,
          type: notifications[1].type,
          preview: notifications[1].preview,
          notiDateTime: notifications[1].notiDateTime.toISOString(),
          read: notifications[1].read,
        },
        {
          _id: notifications[1]._id.toString(),
          notiTo: notifications[1].notiTo,
          notiFrom: notifications[1].notiFrom,
          notiSource: notifications[1].notiSource,
          type: notifications[1].type,
          preview: notifications[1].preview,
          notiDateTime: notifications[1].notiDateTime.toISOString(),
          read: notifications[1].read,
        },
      ]);
    });
    it('should return 500 when getting notifications fails', async () => {
      getNotificationsByUserSpy.mockResolvedValue({
        error: 'Database error',
      });

      const response = await supertest(app).patch('/notification/markAllNotisRead/user1');

      expect(response.status).toBe(500);
      expect(response.text).toContain("Error when marking user's notifications as read");
    });

    it('should return 500 when updating notifications fails', async () => {
      getNotificationsByUserSpy.mockResolvedValue(notifications);

      updateNotificationSpy.mockResolvedValue({
        error: 'Update failed',
      });

      const response = await supertest(app).patch('/notification/markAllNotisRead/user1');

      expect(response.status).toBe(500);
      expect(response.text).toContain("Error when marking user's notifications as read");
    });
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
afterEach(() => {
  jest.resetAllMocks();
});
