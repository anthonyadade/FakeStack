import express, { Response, Request } from 'express';
import { FakeSOSocket, AddMessageRequest, UpdateMessageRequest, Message } from '../types/types';
import { saveMessage, getMessages, updateMessage } from '../services/message.service';

const messageController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided message request contains the required fields.
   *
   * @param req The request object containing the message data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: AddMessageRequest): boolean =>
    req.body.messageToAdd !== null && req.body.messageToAdd !== undefined;

  /**
   * Validates the Message object to ensure it contains the required fields.
   *
   * @param message The message to validate.
   *
   * @returns `true` if the message is valid, otherwise `false`.
   */
  const isMessageValid = (message: Omit<Message, 'type'>): boolean =>
    message.msg !== undefined &&
    message.msg !== '' &&
    message.msgFrom !== undefined &&
    message.msgFrom !== '' &&
    message.msgDateTime !== undefined &&
    message.msgDateTime !== null;

  /**
   * Handles adding a new message. The message is first validated and then saved.
   * If the message is invalid or saving fails, the HTTP response status is updated.
   *
   * @param req The AddMessageRequest object containing the message and chat data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addMessageRoute = async (req: AddMessageRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { messageToAdd: msg } = req.body;

    if (!isMessageValid(msg)) {
      res.status(400).send('Invalid message body');
      return;
    }

    try {
      const msgFromDb = await saveMessage({ ...msg, type: 'global' });

      if ('error' in msgFromDb) {
        throw new Error(msgFromDb.error);
      }

      socket.emit('messageUpdate', { msg: msgFromDb });

      res.json(msgFromDb);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding a message: ${(err as Error).message}`);
    }
  };

  /**
   * Fetch all global messages in ascending order of their date and time.
   * @param req The request object.
   * @param res The HTTP response object used to send back the messages.
   * @returns A Promise that resolves to void.
   */
  const getMessagesRoute = async (_: Request, res: Response): Promise<void> => {
    const messages = await getMessages();
    res.json(messages);
  };

  /**
   * Handles updating a message's `readBy` field. If the username is not already in the `readBy` array,
   * it is added, and the updated message is saved to the database. If the update fails, an error is thrown.
   *
   * @param req The UpdateMessageRequest object containing the message to update and the username.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   *
   * @throws An error if the update operation fails.
   */
  const updateMessageRoute = async (req: UpdateMessageRequest, res: Response): Promise<void> => {
    const { messageToUpdate } = req.body;
    try {
      const updatedMessage = await updateMessage(messageToUpdate._id, messageToUpdate);
      if ('error' in updatedMessage) {
        throw new Error(updatedMessage.error);
      }
      res.json(updatedMessage);
    } catch (err: unknown) {
      res.status(500).send(`Error when updating a message: ${(err as Error).message}`);
    }
  };

  // Add appropriate HTTP verbs and their endpoints to the router
  router.post('/addMessage', addMessageRoute);
  router.get('/getMessages', getMessagesRoute);
  router.patch('/updateMessage/:id', updateMessageRoute);

  return router;
};

export default messageController;
