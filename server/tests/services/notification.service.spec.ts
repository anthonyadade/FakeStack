import mongoose from 'mongoose';
import NotificationModel from '../../models/notification.model';
import UserModel from '../../models/users.model';
import {
  saveNotification,
  getNotificationById,
  getNotificationsByUser,
  updateNotification,
} from '../../services/notification.service';
import { DatabaseNotification, Notification } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const notification1: DatabaseNotification = {
  _id: new mongoose.Types.ObjectId(),
  notiTo: 'sana',
  notiFrom: 'hi',
  notiSource: 'dummy message id',
  type: 'message',
  preview: 'hey sana whats up',
  notiDateTime: new Date('2025-03-22'),
  read: false,
};

describe('Notification model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveNotification', () => {
    const mockNotif: Notification = {
      notiTo: 'userX',
      notiFrom: 'sana',
      notiSource: 'dummy message id',
      type: 'message',
      preview: 'Hey!',
      notiDateTime: new Date('2025-01-01T10:00:00.000Z'),
      read: false,
    };

    it('should create a notification successfully and return the saved notifcation', async () => {
      mockingoose(UserModel).toReturn(
        { _id: new mongoose.Types.ObjectId(), username: 'userX' },
        'findOne',
      );

      const mockCreatedNotif = {
        _id: new mongoose.Types.ObjectId(),
        ...mockNotif,
      };
      mockingoose(NotificationModel).toReturn(mockCreatedNotif, 'create');

      const result = await saveNotification(mockNotif);

      expect(result).toMatchObject({
        notiTo: 'userX',
        notiFrom: 'sana',
        notiSource: 'dummy message id',
        type: 'message',
        preview: 'Hey!',
        notiDateTime: new Date('2025-01-01T10:00:00.000Z'),
        read: false,
      });
    });

    it('should return an error if notif creation fails', async () => {
      mockingoose(UserModel).toReturn({ _id: 'someUserId' }, 'findOne');
      jest.spyOn(NotificationModel, 'create').mockRejectedValueOnce(new Error('Create failed'));

      const result = await saveNotification(mockNotif);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Error occurred when saving notification');
      }
    });

    it('should return an error if the notification object is invalid', async () => {
      const invalidNotification = {
        notiTo: 'userX',
        notiFrom: 'sana',
      };

      jest.spyOn(NotificationModel, 'create').mockRejectedValueOnce(new Error('Validation failed'));

      const result = await saveNotification(invalidNotification as Notification);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when saving notification: Error: Validation failed',
        );
      }
    });

    it('should return an error if the notification object is empty', async () => {
      const emptyNotification = {} as Notification;

      jest
        .spyOn(NotificationModel, 'create')
        .mockRejectedValueOnce(new Error('Empty notification object'));

      const result = await saveNotification(emptyNotification);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when saving notification: Error: Empty notification object',
        );
      }
    });

    it('should return an error if the notification creation fails due to database error', async () => {
      jest.spyOn(NotificationModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      const result = await saveNotification(mockNotif);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when saving notification: Error: Database error',
        );
      }
    });
  });

  describe('getNotificationById', () => {
    const mockNotificationId = new mongoose.Types.ObjectId().toString();
    const mockNotification: DatabaseNotification = {
      _id: new mongoose.Types.ObjectId(mockNotificationId),
      notiTo: 'userX',
      notiFrom: 'sana',
      notiSource: 'dummy message id',
      type: 'message',
      preview: 'Hey!',
      notiDateTime: new Date('2025-01-01T10:00:00.000Z'),
      read: false,
    };

    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should successfully find and return a notification by its ID', async () => {
      mockingoose(NotificationModel).toReturn(mockNotification, 'findOne');

      const result = await getNotificationById(mockNotificationId);

      expect(result).toMatchObject(mockNotification);
    });

    it('should return an error if the notification is not found', async () => {
      mockingoose(NotificationModel).toReturn(null, 'findOne');

      const result = await getNotificationById(mockNotificationId);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when finding notification: Error: Notification not found',
        );
      }
    });

    it('should return an error if the provided ID is invalid', async () => {
      const invalidId = 'invalid-id';

      jest.spyOn(NotificationModel, 'findOne').mockRejectedValueOnce(new Error('Invalid ID'));

      const result = await getNotificationById(invalidId);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when finding notification: BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer',
        );
      }
    });

    it('should return an error if a database error occurs', async () => {
      jest.spyOn(NotificationModel, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const result = await getNotificationById(mockNotificationId);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when finding notification: Error: Invalid ID',
        );
      }
    });

    it('should return an error if the ID is empty', async () => {
      const emptyId = '';

      jest.spyOn(NotificationModel, 'findOne').mockRejectedValueOnce(new Error('Empty ID'));

      const result = await getNotificationById(emptyId);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when finding notification: BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer',
        );
      }
    });
  });

  describe('getNotificationsByUser', () => {
    const mockNotificationId = new mongoose.Types.ObjectId().toString();
    const mockNotificationId2 = new mongoose.Types.ObjectId().toString();
    const mockNotification: DatabaseNotification = {
      _id: new mongoose.Types.ObjectId(mockNotificationId),
      notiTo: 'Sana',
      notiFrom: 'userX',
      notiSource: 'dummy message id',
      type: 'message',
      preview: 'Hey!',
      notiDateTime: new Date('2025-01-01T10:00:00.000Z'),
      read: false,
    };

    const mockNotification2: DatabaseNotification = {
      _id: new mongoose.Types.ObjectId(mockNotificationId2),
      notiTo: 'Sana',
      notiFrom: 'userX',
      notiSource: 'dummy message id',
      type: 'message',
      preview: 'nevermind.',
      notiDateTime: new Date('2025-01-01T10:00:10.000Z'),
      read: false,
    };

    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should successfully find and return all notifications of a user', async () => {
      mockingoose(NotificationModel).toReturn([mockNotification, mockNotification2], 'find');

      const result = await getNotificationsByUser('sana');

      expect(result).toMatchObject([mockNotification, mockNotification2]);
    });

    it('should return an empty array if user has no notifications', async () => {
      mockingoose(NotificationModel).toReturn([], 'find');

      const result = await getNotificationsByUser('sana');

      expect(result).toMatchObject([]);
    });

    it('should return an error if database error occurs', async () => {
      jest
        .spyOn(NotificationModel, 'find')
        .mockRejectedValueOnce(new Error('Error retrieving document'));

      const result = await getNotificationsByUser('sana');

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when finding notifications: Error: Error retrieving document',
        );
      }
    });
  });

  describe('updateNotification', () => {
    const updatedNotification: DatabaseNotification = {
      ...notification1,
      read: true,
    };

    const updates: Partial<Notification> = {
      read: true,
    };

    it('should update the notification if notification is found', async () => {
      mockingoose(NotificationModel).toReturn(updatedNotification, 'findOneAndUpdate');

      const result = (await updateNotification(
        String(notification1._id),
        updates,
      )) as DatabaseNotification;

      expect(result.notiTo).toEqual(notification1.notiTo);
      expect(result.notiFrom).toEqual(notification1.notiFrom);
      expect(result.notiSource).toEqual(notification1.notiSource);
      expect(result.type).toEqual(notification1.type);
      expect(result.preview).toEqual(notification1.preview);
      expect(result.notiDateTime).toEqual(notification1.notiDateTime);

      expect(result.read).not.toEqual(notification1.read);
    });

    it('should return an error if update fails because notification not found', async () => {
      mockingoose(NotificationModel).toReturn(null, 'findOneAndUpdate');

      const result = (await updateNotification(
        String(notification1._id),
        updates,
      )) as DatabaseNotification;
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when updating notification: Error: Error updating notification',
        );
      }
    });

    it('should return an error if the provided notification ID is invalid', async () => {
      const invalidId = new mongoose.Types.ObjectId();

      jest
        .spyOn(NotificationModel, 'findOneAndUpdate')
        .mockRejectedValueOnce(new Error('Invalid ID'));

      const result = await updateNotification(String(invalidId), updates);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when updating notification: Error: Invalid ID',
        );
      }
    });

    it('should return an error if a database error occurs', async () => {
      jest
        .spyOn(NotificationModel, 'findOneAndUpdate')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await updateNotification(String(notification1._id), updates);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when updating notification: Error: Database error',
        );
      }
    });

    it('should return an error if the updates object is empty', async () => {
      const emptyUpdates = {};

      jest
        .spyOn(NotificationModel, 'findOneAndUpdate')
        .mockRejectedValueOnce(new Error('Empty updates object'));

      const result = await updateNotification(String(notification1._id), emptyUpdates);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain(
          'Error occurred when updating notification: Error: Empty updates object',
        );
      }
    });
  });
});
