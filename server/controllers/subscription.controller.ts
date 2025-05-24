import express, { Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import {
  AddSubscriptionRequest,
  FakeSOSocket,
  SubscriptionRequest,
  SubscriptionResponse,
} from '../types/types';
import {
  getSubscriptionById,
  saveSubscription,
  deleteSubscription,
  addSubscriptionToQuestion,
  addSubscriptionToChat,
} from '../services/subscription.service';

const subscriptionController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Function for checking if an AddSubscriptionRequest body is valid.
   * @param req An AddSubscriptionRequest to check the body of.
   * @returns True if the body is valid, otherwise false.
   */
  const isSubscriptionBodyValid = (req: AddSubscriptionRequest): boolean =>
    req.body !== undefined &&
    req.body.id !== undefined &&
    req.body.id.trim() !== '' &&
    req.body.subscription.type !== undefined &&
    ['thread', 'chat'].includes(req.body.subscription.type) &&
    req.body.subscription.subscriber !== undefined &&
    req.body.subscription.subscriber.trim() !== '';

  /**
   * Adds a new subscription to the database.
   *
   * @param req The AddSubscriptionRequest object to add.
   * @param res The HTTP response object used to send back the result of the operation.
   * @returns A Promise that resolves to void.
   */
  const addSubscription = async (req: AddSubscriptionRequest, res: Response): Promise<void> => {
    if (!isSubscriptionBodyValid(req)) {
      res.status(400).send('Invalid subscription body');
      return;
    }

    // Get the subscription to add from the request.
    const { id, subscription } = req.body;

    // Create the requested subscription.
    try {
      const result: SubscriptionResponse = await saveSubscription(subscription);

      if ('error' in result) {
        throw new Error(result.error);
      }

      let status;
      if (result.type === 'thread') {
        status = await addSubscriptionToQuestion(id, result);
      } else if (result.type === 'chat') {
        status = await addSubscriptionToChat(id, result);
      }

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving subscription: ${error}`);
    }
  };

  /**
   * Gets a subscription from the database based on its ID.
   *
   * @param req The SubscriptionRequest object containing the subscription ID.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const getSubscription = async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.params;

      const subscription = await getSubscriptionById(subscriptionId);

      if ('error' in subscription) {
        throw Error(subscription.error);
      }

      res.status(200).json(subscription);
    } catch (error) {
      res.status(500).send(`Error when getting subscription: ${error}`);
    }
  };

  /**
   * Mark a notification as read.
   *
   * @param req The NotificationByIdRequest containing the notification ID as a route parameter.
   * @param res The HTTP response object used to send back the result of the operation.
   * @returns A Promise that resolves to void.
   */
  const removeSubscription = async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      // Fetch the specified notification.
      const { subscriptionId } = req.params;

      if (!ObjectId.isValid(subscriptionId)) {
        res.status(400).send('Invalid ID format');
        return;
      }

      const removed = await deleteSubscription(subscriptionId);

      if ('error' in removed) {
        throw Error(removed.error);
      }

      res.status(200).json(removed);
    } catch (error) {
      res.status(500).send(`Error when updating notification read status: ${error}`);
    }
  };

  // API Endpoints
  router.post('/addSubscription', addSubscription); // create and add a new subscription to the database
  router.get('/getSubscription/:subscriptionId', getSubscription); // get a specific subscription
  router.delete('/removeSubscription/:subscriptionId', removeSubscription); // deletes a subscription

  return router;
};

export default subscriptionController;
