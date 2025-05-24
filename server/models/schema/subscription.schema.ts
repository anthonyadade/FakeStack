import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Susbcription collection.
 *
 * This schema defines the structure of a subscription in the database.
 * Each notification includes the following fields:
 * - `type`: Type of subscription being received, either a chat or thread.
 * - `subscriber`: The user this subscription is for.
 */
const subscriberSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['thread', 'chat'],
    },
    subscriber: {
      type: String,
    },
  },
  { collection: 'Subscription' },
);

export default subscriberSchema;
