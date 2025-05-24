import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Notification collection.
 *
 * This schema defines the structure of a notification in the database.
 * Each notification includes the following fields:
 * - `notiTo`: The user the notification is being received by.
 * - `notiSource`: The ID of the object responsible for the notification.
 * - `type`: Type of notification being received, either a message, answer, or comment.
 * - `preview`: A preview of the notification's content.
 * - `notiFrom`: The user responsible for the update triggering this notification
 * - `notiDateTime`: Timestamp of when notification was received.
 * - `read`: Whether the notification has been read by the recipient or not.
 */
const notifSchema: Schema = new Schema(
  {
    notiTo: {
      type: String,
    },
    notiSource: {
      type: String,
    },
    type: {
      type: String,
      enum: ['message', 'answer', 'comment'],
    },
    preview: {
      type: String,
    },
    notiFrom: {
      type: String,
    },
    notiDateTime: {
      type: Date,
    },
    read: {
      type: Boolean,
    },
  },
  { collection: 'Notification' },
);

export default notifSchema;
