import mongoose from 'mongoose';
import MessageModel from '../../models/messages.model';
import UserModel from '../../models/users.model';
import {
  getMessageById,
  getMessages,
  saveMessage,
  updateMessage,
} from '../../services/message.service';
import { Message } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const message1: Message = {
  msg: 'Hello',
  msgFrom: 'User1',
  msgDateTime: new Date('2024-06-04'),
  type: 'global',
  readBy: [],
};

const message2: Message = {
  msg: 'Hi',
  msgFrom: 'User2',
  msgDateTime: new Date('2024-06-05'),
  type: 'global',
  readBy: [],
};

describe('Message model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveMessage', () => {
    const mockMessage: Message = {
      msg: 'Hey!',
      msgFrom: 'userX',
      msgDateTime: new Date('2025-01-01T10:00:00.000Z'),
      type: 'direct',
      readBy: [],
    };

    it('should create a message successfully if user exists', async () => {
      mockingoose(UserModel).toReturn(
        { _id: new mongoose.Types.ObjectId(), username: 'userX' },
        'findOne',
      );

      const mockCreatedMsg = {
        _id: new mongoose.Types.ObjectId(),
        ...mockMessage,
      };
      mockingoose(MessageModel).toReturn(mockCreatedMsg, 'create');

      const result = await saveMessage(mockMessage);

      expect(result).toMatchObject({
        msg: 'Hey!',
        msgFrom: 'userX',
        msgDateTime: new Date('2025-01-01T10:00:00.000Z'),
        type: 'direct',
      });
    });

    it('should return an error if user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await saveMessage(mockMessage);
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Message sender is invalid');
      }
    });

    it('should return an error if message creation fails', async () => {
      mockingoose(UserModel).toReturn({ _id: 'someUserId' }, 'findOne');
      jest.spyOn(MessageModel, 'create').mockRejectedValueOnce(new Error('Create failed'));

      const result = await saveMessage(mockMessage);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Error when saving a message');
      }
    });
  });

  describe('getMessages', () => {
    it('should return all messages, sorted by date', async () => {
      mockingoose(MessageModel).toReturn([message2, message1], 'find');

      const messages = await getMessages();

      expect(messages).toMatchObject([message1, message2]);
    });

    it('should return an empty array if error when retrieving messages', async () => {
      jest
        .spyOn(MessageModel, 'find')
        .mockRejectedValueOnce(() => new Error('Error retrieving documents'));

      const messages = await getMessages();

      expect(messages).toEqual([]);
    });
  });

  describe('getMessageById', () => {
    it('should return a message if it exists', async () => {
      const messageId = new mongoose.Types.ObjectId();
      const mockMessage = {
        _id: messageId,
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
        readBy: [],
      };

      mockingoose(MessageModel).toReturn(mockMessage, 'findOne');

      const result = await getMessageById(messageId);

      expect(result).toMatchObject(mockMessage);
    });

    it('should return an error if the message is not found', async () => {
      const messageId = new mongoose.Types.ObjectId();

      mockingoose(MessageModel).toReturn(null, 'findOne');

      const result = await getMessageById(messageId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Message not found');
      }
    });

    it('should return an error if an exception occurs', async () => {
      const messageId = new mongoose.Types.ObjectId();

      jest.spyOn(MessageModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      const result = await getMessageById(messageId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error when saving a message: Database error');
      }
    });
  });

  describe('updateMessage', () => {
    it('should update a message successfully', async () => {
      const messageId = new mongoose.Types.ObjectId();
      const updatedMessage = { msg: 'Updated message' };

      const mockMessage = {
        _id: messageId,
        msg: 'Updated message',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
        readBy: [],
      };

      // Mock the message update
      mockingoose(MessageModel).toReturn(mockMessage, 'findOneAndUpdate');

      const result = await updateMessage(messageId, updatedMessage);

      expect(result).toMatchObject(mockMessage);
    });

    it('should return an error if the message is not found', async () => {
      const messageId = new mongoose.Types.ObjectId();
      const updatedMessage = { msg: 'Updated message' };

      // Mock no message found
      mockingoose(MessageModel).toReturn(null, 'findOneAndUpdate');

      const result = await updateMessage(messageId, updatedMessage);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Message not found');
      }
    });

    it('should return an error if an exception occurs', async () => {
      const messageId = new mongoose.Types.ObjectId();
      const updatedMessage = { msg: 'Updated message' };

      // Mock an exception
      jest
        .spyOn(MessageModel, 'findByIdAndUpdate')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await updateMessage(messageId, updatedMessage);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error when updating a message: Database error');
      }
    });
  });
});
