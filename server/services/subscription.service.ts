import { DeleteResult, ObjectId } from 'mongodb';
import SubscriptionModel from '../models/subscription.model';
import {
  ChatResponse,
  DatabaseChat,
  DatabaseQuestion,
  DatabaseSubscription,
  QuestionResponse,
  Subscription,
  SubscriptionResponse,
} from '../types/types';
import QuestionModel from '../models/questions.model';
import ChatModel from '../models/chat.model';

/**
 * Saves a new subscription to the database.
 *
 * @param {Subscription} subscription - The subscription object to be saved containing relevant details.
 * @returns {Promise<SubscriptionResponse>} - Resolves with the saved subscription object or an error message.
 */
export const saveSubscription = async (
  subscription: Subscription,
): Promise<SubscriptionResponse> => {
  try {
    const result: DatabaseSubscription = await SubscriptionModel.create(subscription);

    if (!result) {
      throw Error('Failed to create subscription');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving subscription: ${error}` };
  }
};

/**
 * Gets a subscription by its unique identifier.
 *
 * @param {string} id - The ID of the subscription to get.
 * @returns {Promise<SubscriptionResponse>} - Resolves with the found subscription object or an error message.
 */
export const getSubscriptionById = async (id: string) => {
  try {
    const subscription: Subscription | null = await SubscriptionModel.findOne({
      _id: new ObjectId(id),
    });

    if (!subscription) {
      throw Error('Subscription not found');
    }

    return subscription;
  } catch (error) {
    return { error: `Error occurred when finding subscription: ${error}` };
  }
};

/**
 * Removes a subscription by its unique identifier.
 *
 * @param id - The ID of the subscription to remove.
 * @returns {Promise<DeletedSubscriptionResponse>} - Resolves with the deleted subscription object or an error message.
 */
export const deleteSubscription = async (id: string) => {
  try {
    const sub = await getSubscriptionById(id);

    if ('error' in sub) {
      throw new Error('Subscription not found');
    }

    const removed: DeleteResult | null = await SubscriptionModel.deleteOne({
      _id: new ObjectId(id),
    });

    if (!removed || removed.acknowledged === false || removed.deletedCount !== 1) {
      throw Error('Subscription not found');
    }

    if (sub.type === 'thread') {
      await QuestionModel.updateMany({ subscriptions: id }, { $pull: { subscriptions: id } });
    } else if (sub.type === 'chat') {
      await ChatModel.updateMany({ subscriptions: id }, { $pull: { subscriptions: id } });
    }

    return removed;
  } catch (error) {
    return { error: `Error occurred when deleting subscription: ${error}` };
  }
};

/**
 * Adds an subscription to a specified question in the database.
 *
 * @param {string} qid - The ID of the question to which the answer will be added.
 * @param {DatabaseSubscription} sub - The subscription to associate with the question.
 * @returns {Promise<QuestionResponse>} - A promise resolving to the updated question or an error message.
 */
export const addSubscriptionToQuestion = async (
  qid: string,
  sub: DatabaseSubscription,
): Promise<QuestionResponse> => {
  try {
    if (!sub || !sub.type || !sub.subscriber) {
      throw new Error('Invalid subscription');
    }

    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: qid },
      { $push: { subscriptions: { $each: [sub._id], $position: 0 } } },
      { new: true },
    );

    if (result === null) {
      throw new Error('Error when adding subscription to question');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding subscription to question' };
  }
};

/**
 * Adds an subscription to a specified chat in the database.
 *
 * @param {string} cid - The ID of the chat to which the answer will be added.
 * @param {DatabaseSubscription} sub - The subscription to associate with the chat.
 * @returns {Promise<ChatResponse>} - A promise resolving to the updated chat or an error message.
 */
export const addSubscriptionToChat = async (
  cid: string,
  sub: DatabaseSubscription,
): Promise<ChatResponse> => {
  try {
    if (!sub || !sub.type || !sub.subscriber) {
      throw new Error('Invalid subscription');
    }

    const result: DatabaseChat | null = await ChatModel.findOneAndUpdate(
      { _id: cid },
      { $push: { subscriptions: { $each: [sub._id], $position: 0 } } },
      { new: true },
    );

    if (result === null) {
      throw new Error('Error when adding subscription to chat');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding subscription to chat' };
  }
};
