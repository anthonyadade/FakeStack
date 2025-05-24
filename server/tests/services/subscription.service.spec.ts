import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import SubscriptionModel from '../../models/subscription.model';
import QuestionModel from '../../models/questions.model';
import ChatModel from '../../models/chat.model';
import {
  saveSubscription,
  getSubscriptionById,
  deleteSubscription,
  addSubscriptionToQuestion,
  addSubscriptionToChat,
} from '../../services/subscription.service';
import { DatabaseSubscription, DatabaseQuestion, DatabaseChat } from '../../types/types';
import { QUESTIONS } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

export const subMock: DatabaseSubscription = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6ab'),
  subscriber: 'subscriber1',
  type: 'thread',
};

export const subMock2: DatabaseSubscription = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6ac'),
  subscriber: 'subscriber2',
  type: 'chat',
};

export const chatMock: DatabaseChat = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6ac'),
  subscriptions: [],
  messages: [],
  createdAt: new Date('2025-03-01T00:00:00'),
  updatedAt: new Date('2025-03-02T00:00:00'),
  participants: [],
};

describe('Subscription Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveSubscription', () => {
    test('saveSubscription should return the saved subscription', async () => {
      mockingoose(SubscriptionModel).toReturn(subMock, 'create');
      const result = (await saveSubscription(subMock)) as DatabaseSubscription;
      expect(result._id).toBeDefined();
      expect(result.subscriber).toEqual(subMock.subscriber);
      expect(result.type).toEqual(subMock.type);
    });
  });

  describe('getSubscriptionById', () => {
    test('getSubscriptionById should return the subscription when found', async () => {
      mockingoose(SubscriptionModel).toReturn(subMock, 'findOne');
      const result = await getSubscriptionById(subMock._id.toString());
      // Fail the test if an error is received.
      if ('error' in result) {
        expect(result).toEqual(subMock);
        return;
      }
      expect(result.subscriber).toEqual(subMock.subscriber);
      expect(result.type).toEqual(subMock.type);
    });

    test('getSubscriptionById should return error when subscription is not found', async () => {
      mockingoose(SubscriptionModel).toReturn(null, 'findOne');
      const result = await getSubscriptionById(new mongoose.Types.ObjectId().toString());
      expect(result).toEqual({
        error: 'Error occurred when finding subscription: Error: Subscription not found',
      });
    });
  });

  describe('deleteSubscription', () => {
    test('deleteSubscription should return removed object when deletion is successful', async () => {
      const deleteResult = { acknowledged: true, deletedCount: 1 };
      const subId = new mongoose.Types.ObjectId().toString();
      mockingoose(SubscriptionModel).toReturn(deleteResult, 'deleteOne');
      mockingoose(SubscriptionModel).toReturn(subMock, 'findOne');
      const result = await deleteSubscription(subId);
      expect(result).toEqual(deleteResult);
    });

    test('deleteSubscription should return removed object when deletion is successful (on a chat sub for full coverage)', async () => {
      const deleteResult = { acknowledged: true, deletedCount: 1 };
      const subId = new mongoose.Types.ObjectId().toString();
      mockingoose(SubscriptionModel).toReturn(deleteResult, 'deleteOne');
      mockingoose(SubscriptionModel).toReturn(subMock2, 'findOne');
      const result = await deleteSubscription(subId);
      expect(result).toEqual(deleteResult);
    });

    test('deleteSubscription should return error if the sub returns null', async () => {
      const subId = new mongoose.Types.ObjectId().toString();
      mockingoose(SubscriptionModel).toReturn(null, 'deleteOne');
      mockingoose(SubscriptionModel).toReturn(null, 'findOne');
      const result = await deleteSubscription(subId);
      expect(result).toEqual({
        error: 'Error occurred when deleting subscription: Error: Subscription not found',
      });
    });

    test('deleteSubscription should return error if deletion returns null', async () => {
      const subId = new mongoose.Types.ObjectId().toString();
      mockingoose(SubscriptionModel).toReturn(null, 'deleteOne');
      mockingoose(SubscriptionModel).toReturn(subMock, 'findOne');
      const result = await deleteSubscription(subId);
      expect(result).toEqual({
        error: 'Error occurred when deleting subscription: Error: Subscription not found',
      });
    });

    test('deleteSubscription should return error if deletion is not acknowledged or deletedCount is not 1', async () => {
      const subId = new mongoose.Types.ObjectId().toString();
      const deleteResult = { acknowledged: false, deletedCount: 0 };
      mockingoose(SubscriptionModel).toReturn(deleteResult, 'deleteOne');
      const result = await deleteSubscription(subId);
      expect(result).toEqual({
        error: 'Error occurred when deleting subscription: Error: Subscription not found',
      });
    });
  });

  describe('addSubscriptionToQuestion', () => {
    test('addSubscriptionToQuestion should return updated question when subscription is added', async () => {
      const questionMock: DatabaseQuestion = { ...QUESTIONS[0] };
      const updatedQuestion: DatabaseQuestion = {
        ...questionMock,
        subscriptions: [subMock._id, ...questionMock.subscriptions],
      };
      mockingoose(QuestionModel).toReturn(updatedQuestion, 'findOneAndUpdate');
      const result = (await addSubscriptionToQuestion(
        questionMock._id.toString(),
        subMock,
      )) as DatabaseQuestion;
      expect(result.subscriptions).toContainEqual(subMock._id);
    });

    test('addSubscriptionToQuestion should return error when subscription is invalid', async () => {
      const invalidSub = { _id: subMock._id } as DatabaseSubscription;
      const result = await addSubscriptionToQuestion(QUESTIONS[0]._id.toString(), invalidSub);
      expect(result).toEqual({
        error: 'Error when adding subscription to question',
      });
    });

    test('addSubscriptionToQuestion should return error when findOneAndUpdate returns null', async () => {
      mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');
      const result = await addSubscriptionToQuestion(QUESTIONS[0]._id.toString(), subMock);
      expect(result).toEqual({
        error: 'Error when adding subscription to question',
      });
    });
  });

  describe('addSubscriptionToChat', () => {
    test('addSubscriptionToChat should return updated chat when subscription is added', async () => {
      const updatedChat: DatabaseChat = {
        ...chatMock,
        subscriptions: [subMock._id, ...chatMock.subscriptions],
      };
      mockingoose(ChatModel).toReturn(updatedChat, 'findOneAndUpdate');
      const result = (await addSubscriptionToChat(
        chatMock._id.toString(),
        subMock,
      )) as DatabaseChat;
      expect(result.subscriptions).toContainEqual(subMock._id);
    });

    test('addSubscriptionToChat should return error when subscription is invalid', async () => {
      const invalidSub = { ...subMock, subscriber: '' } as DatabaseSubscription;
      const result = await addSubscriptionToChat(chatMock._id.toString(), invalidSub);
      expect(result).toEqual({
        error: 'Error when adding subscription to chat',
      });
    });

    test('addSubscriptionToChat should return error when findOneAndUpdate returns null', async () => {
      mockingoose(ChatModel).toReturn(null, 'findOneAndUpdate');
      const result = await addSubscriptionToChat(chatMock._id.toString(), subMock);
      expect(result).toEqual({
        error: 'Error when adding subscription to chat',
      });
    });
  });
});
