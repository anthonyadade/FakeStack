import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Chat collection.
 *
 * - `participants`: an array of ObjectIds referencing the User collection.
 * - `messages`: an array of ObjectIds referencing the Message collection.
 * - `subscriptions`: an array of ObjectIds referencing the Subscription collection.
 * - Timestamps store `createdAt` & `updatedAt`.
 */
const chatSchema = new Schema(
  {
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
      },
    ],
  },
  {
    collection: 'Chat',
    timestamps: true,
  },
);

export default chatSchema;
