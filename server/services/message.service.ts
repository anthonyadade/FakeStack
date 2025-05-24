import { ObjectId } from 'mongodb';
import MessageModel from '../models/messages.model';
import UserModel from '../models/users.model';
import { DatabaseMessage, DatabaseUser, Message, MessageResponse } from '../types/types';

/**
 * Saves a new message to the database.
 * @param {Message} message - The message to save
 * @returns {Promise<MessageResponse>} - The saved message or an error message
 */
export const saveMessage = async (message: Message): Promise<MessageResponse> => {
  try {
    const user: DatabaseUser | null = await UserModel.findOne({ username: message.msgFrom });

    if (!user) {
      throw new Error('Message sender is invalid or does not exist.');
    }

    const result: DatabaseMessage = await MessageModel.create(message);
    return result;
  } catch (error) {
    return { error: `Error when saving a message: ${(error as Error).message}` };
  }
};

/**
 * Retrieves all global messages from the database, sorted by date in ascending order.
 * @returns {Promise<DatabaseMessage[]>} - An array of messages or an empty array if error occurs.
 */
export const getMessages = async (): Promise<DatabaseMessage[]> => {
  try {
    const messages: DatabaseMessage[] = await MessageModel.find({ type: 'global' });
    messages.sort((a, b) => a.msgDateTime.getTime() - b.msgDateTime.getTime());

    return messages;
  } catch (error) {
    return [];
  }
};
/**
 * Fetches a message by its ObjectId.
 * @param {ObjectId} messageId - The ObjectId of the message to retrieve.
 * @returns {Promise<DatabaseMessage | null>} - The message document or null if not found.
 */
export const getMessageById = async (messageId: ObjectId): Promise<MessageResponse> => {
  try {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  } catch (error) {
    return { error: `Error when saving a message: ${(error as Error).message}` };
  }
};

/**
 * Updates a message by its ObjectId.
 * @param {ObjectId} messageId - The ObjectId of the message to update.
 * @param {Partial<Message>} updatedMessage - The updated message data.
 * @returns {Promise<MessageResponse>} - The updated message or an error message.
 */
export const updateMessage = async (
  messageId: ObjectId,
  updatedMessage: Partial<Message>,
): Promise<MessageResponse> => {
  try {
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { $set: updatedMessage },
      { new: true },
    );

    if (!message) {
      throw new Error('Message not found');
    }

    return message;
  } catch (error) {
    return { error: `Error when updating a message: ${(error as Error).message}` };
  }
};
