import { PopulatedDatabaseChat, PopulatedDatabaseQuestion, Subscription } from '../types/types';
import api from './config';

const SUB_API_URL = `${process.env.REACT_APP_SERVER_URL}/subscription`;

/**
 * Subscribe a user to an object's notifications.
 *
 * @param subscriptionObjectId - The ID of the object to subscribe to.
 * @param subscriber - The username to subscribe to the object.
 * @param type - The type of subscription to create (chat, thread, etc.)
 * @throws Error if the API was unable to add the subscription.
 */
export const createSubscription = async (
  subscriptionObjectId: string,
  subscriber: string,
  type: string,
) => {
  const payload = {
    subscription: {
      type,
      subscriber,
    },
    id: subscriptionObjectId,
  };
  const res = await api.post(`${SUB_API_URL}/addSubscription`, payload);
  if (res.status !== 200) {
    throw new Error('Error while subscribing user');
  }
  return res.data;
};

/**
 * Remove a subscription.
 *
 * @param subscriptionId - The ID of the subscription to remove.
 * @throws Error if the API was unable to remove the subscription.
 */
export const removeSubscription = async (subscriptionId: string) => {
  const res = await api.delete(`${SUB_API_URL}/removeSubscription/${subscriptionId}`);
  if (res.status !== 200) {
    throw new Error('Error while removing subscription');
  }
  return res.data;
};

/**
 * Function for populating a subscribed object if populateDatabase in database utils neglects to do so for that object type.
 * @param subscribedObject - The object to populate.
 * @returns - The populated object.
 */
export const populateSubscriptionObject = async (
  subscribedObject: PopulatedDatabaseQuestion | PopulatedDatabaseChat,
) => {
  const responses = await Promise.all(
    subscribedObject.subscriptions.map(async (s: Subscription) => {
      const response = await api.get(`${SUB_API_URL}/getSubscription/${s}`);
      return { ...response.data, _id: s };
    }),
  );
  return responses;
};

/**
 * Check if a user is subscribed to an object.
 *
 * @param subscribedObject - The object to check.
 * @param user - The user to check subscription for.
 * @returns the ID of the subscription.
 */
export const getUserSubscriptionId = async (
  subscribedObject: PopulatedDatabaseQuestion | PopulatedDatabaseChat,
  user: string,
): Promise<string | undefined> => {
  // Handle weirdness where some objects are populated randomly and some aren't.
  let subs;
  if (typeof subscribedObject.subscriptions[0] === 'string') {
    subs = await populateSubscriptionObject(subscribedObject);
  } else {
    subs = subscribedObject.subscriptions;
  }
  // Find and return the correct record.
  const subscription = subs.find(s => s.subscriber === user);
  return subscription?._id;
};
