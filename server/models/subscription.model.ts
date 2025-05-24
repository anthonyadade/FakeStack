import mongoose, { Model } from 'mongoose';
import subscriptionSchema from './schema/subscription.schema';
import { DatabaseSubscription } from '../types/types';

/**
 * Mongoose model for the `Notification` collection.
 *
 * This model is created using the `Notification` interface and the `notificationSchema`, representing the
 * `Notification` collection in the MongoDB database, and provides an interface for interacting with
 * the stored notification.
 *
 * @type {Model<DatabaseSubscription>}
 */
const SubscriptionModel: Model<DatabaseSubscription> = mongoose.model<DatabaseSubscription>(
  'Subscription',
  subscriptionSchema,
);

export default SubscriptionModel;
