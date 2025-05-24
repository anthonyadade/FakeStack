import mongoose from 'mongoose';
import supertest from 'supertest';
import { DatabaseSubscription, SubscriptionResponse } from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as subscriptionService from '../../services/subscription.service';

const saveSubscriptionSpy = jest.spyOn(subscriptionService, 'saveSubscription');
const addSubscriptionToQuestionSpy = jest.spyOn(subscriptionService, 'addSubscriptionToQuestion');
const addSubscriptionToChatSpy = jest.spyOn(subscriptionService, 'addSubscriptionToChat');
const getSubscriptionByIdSpy = jest.spyOn(subscriptionService, 'getSubscriptionById');
const deleteSubscriptionSpy = jest.spyOn(subscriptionService, 'deleteSubscription');

describe('Subscription Controller', () => {
  describe('POST /subscription/addSubscription', () => {
    it('should add a new subscription to a question when type is "thread"', async () => {
      const validQid = new mongoose.Types.ObjectId();
      const validSubId = new mongoose.Types.ObjectId();
      const mockReqBody = {
        id: validQid.toString(),
        subscription: {
          type: 'thread',
          subscriber: 'dummyUser',
        },
      };

      const mockSubscription = {
        _id: validSubId,
        type: 'thread',
        subscriber: 'dummyUser',
      } as SubscriptionResponse;

      saveSubscriptionSpy.mockResolvedValueOnce(mockSubscription);
      addSubscriptionToQuestionSpy.mockResolvedValueOnce({
        _id: validQid,
        title: 'Test question',
        text: 'Test text',
        tags: [],
        askedBy: 'dummyUser',
        askDateTime: new Date('2024-06-03'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [],
        comments: [],
        subscriptions: [validSubId],
      });

      const response = await supertest(app).post('/subscription/addSubscription').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: validSubId.toString(),
        type: 'thread',
        subscriber: 'dummyUser',
      });
    });

    it('should add a new subscription to a chat when type is "chat"', async () => {
      const validCid = new mongoose.Types.ObjectId();
      const validSubId = new mongoose.Types.ObjectId();
      const mockReqBody = {
        id: validCid.toString(),
        subscription: {
          type: 'chat',
          subscriber: 'dummyUser',
        },
      };

      const mockSubscription = {
        _id: validSubId,
        type: 'chat',
        subscriber: 'dummyUser',
      } as SubscriptionResponse;

      saveSubscriptionSpy.mockResolvedValueOnce(mockSubscription);
      addSubscriptionToChatSpy.mockResolvedValueOnce({
        _id: validCid,
        messages: [],
        participants: [],
        subscriptions: [validSubId],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await supertest(app).post('/subscription/addSubscription').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: validSubId.toString(),
        type: 'chat',
        subscriber: 'dummyUser',
      });
    });

    it('should return 400 if the subscription body is invalid', async () => {
      const mockReqBody = {
        id: '   ',
        subscription: {
          type: 'thread',
          subscriber: 'dummyUser',
        },
      };

      const response = await supertest(app).post('/subscription/addSubscription').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid subscription body');
    });

    it('should return 500 if saveSubscription returns an error', async () => {
      const validQid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        id: validQid.toString(),
        subscription: {
          type: 'thread',
          subscriber: 'dummyUser',
        },
      };

      saveSubscriptionSpy.mockResolvedValueOnce({ error: 'Error when saving subscription' });

      const response = await supertest(app).post('/subscription/addSubscription').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toBe(
        'Error when saving subscription: Error: Error when saving subscription',
      );
    });

    it('should return 500 if addSubscriptionToQuestion returns an error', async () => {
      const validQid = new mongoose.Types.ObjectId();
      const validSubId = new mongoose.Types.ObjectId();
      const mockReqBody = {
        id: validQid.toString(),
        subscription: {
          type: 'thread',
          subscriber: 'dummyUser',
        },
      };

      const mockSubscription = {
        _id: validSubId,
        type: 'thread',
        subscriber: 'dummyUser',
      } as SubscriptionResponse;

      saveSubscriptionSpy.mockResolvedValueOnce(mockSubscription);
      addSubscriptionToQuestionSpy.mockResolvedValueOnce({
        error: 'Error when adding subscription to question',
      });

      const response = await supertest(app).post('/subscription/addSubscription').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toBe(
        'Error when saving subscription: Error: Error when adding subscription to question',
      );
    });
  });

  describe('GET /subscription/getSubscription/:subscriptionId', () => {
    it('should get a subscription by its ID', async () => {
      const validSubId = new mongoose.Types.ObjectId();
      const mockSubscription = {
        _id: validSubId,
        type: 'thread',
        subscriber: 'dummyUser',
      } as DatabaseSubscription;

      getSubscriptionByIdSpy.mockResolvedValueOnce(mockSubscription);

      const response = await supertest(app).get(
        `/subscription/getSubscription/${validSubId.toString()}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: validSubId.toString(),
        type: 'thread',
        subscriber: 'dummyUser',
      });
    });

    it('should return 500 if getSubscriptionById returns an error', async () => {
      const validSubId = new mongoose.Types.ObjectId();
      getSubscriptionByIdSpy.mockResolvedValueOnce({ error: 'Subscription not found' });

      const response = await supertest(app).get(
        `/subscription/getSubscription/${validSubId.toString()}`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when getting subscription: Error: Subscription not found');
    });
  });

  describe('DELETE /subscription/removeSubscription/:subscriptionId', () => {
    it('should remove a subscription when a valid ID is provided', async () => {
      const validSubId = new mongoose.Types.ObjectId();
      const mockDeleteResult = { acknowledged: true, deletedCount: 1 };

      deleteSubscriptionSpy.mockResolvedValueOnce(mockDeleteResult);

      const response = await supertest(app).delete(
        `/subscription/removeSubscription/${validSubId.toString()}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDeleteResult);
    });

    it('should return 400 if subscriptionId is not a valid ObjectId', async () => {
      const response = await supertest(app).delete(
        '/subscription/removeSubscription/invalidObjectId',
      );
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid ID format');
    });

    it('should return 500 if deleteSubscription returns an error', async () => {
      const validSubId = new mongoose.Types.ObjectId();
      deleteSubscriptionSpy.mockResolvedValueOnce({ error: 'Error when deleting subscription' });

      const response = await supertest(app).delete(
        `/subscription/removeSubscription/${validSubId.toString()}`,
      );

      expect(response.status).toBe(500);
      expect(response.text).toBe(
        'Error when updating notification read status: Error: Error when deleting subscription',
      );
    });
  });
});
