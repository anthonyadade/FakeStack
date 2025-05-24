import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a subscription.
 * - `type`: Type of notification being received, either a message, answer, or comment.
 * - `subscriber`: The user this subscription is for.
 */
export interface Subscription {
  type: 'thread' | 'chat';
  subscriber: string;
}

/**
 * Represents a subscription stored in the database.
 * - `_id`: Unique ID of the subscription.
 */
export interface DatabaseSubscription extends Subscription {
  _id: ObjectId;
}

/**
 * Type representing possible responses for a subscription-related operation.
 * - Either a `DatabaseSubscription` object or an error message.
 */
export type SubscriptionResponse = DatabaseSubscription | { error: string };

/**
 * Type representing possible responses for multiple subscription-related operation.
 * - Either a `DatabaseSubscription[]` list of objects or an error message.
 */
export type SubscriptionsResponse = DatabaseSubscription[] | { error: string };

/**
 * Type representing responses for deleted subscriptions.
 * - Either a boolean representing success, or an error message.
 */
export type DeletedSubscriptionResponse = boolean | { error: string };

/**
 * Express request for creating a subscription.
 * - `body`: Contains the `subscription` object, which includes the subscription metadata and ID of what to attach the subscription to.
 */
export interface AddSubscriptionRequest extends Request {
  body: {
    subscription: Subscription;
    id: string;
  };
}

/**
 * Express request for getting a subscription by its ID.
 * - `params`: Contains the `_id`, the unique identifier for the subscription to find.
 */
export interface SubscriptionRequest extends Request {
  params: {
    subscriptionId: string;
  };
}
