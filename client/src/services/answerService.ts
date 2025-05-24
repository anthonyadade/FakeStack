import { Answer, PopulatedDatabaseAnswer, Subscription } from '../types/types';
import api from './config';

const ANSWER_API_URL = `${process.env.REACT_APP_SERVER_URL}/answer`;
const QUESTION_API_URL = `${process.env.REACT_APP_SERVER_URL}/question`;
const NOTIFICATION_API_URL = `${process.env.REACT_APP_SERVER_URL}/notification`;

/**
 * Adds a new answer to a specific question.
 *
 * @param qid - The ID of the question to which the answer is being added.
 * @param ans - The answer object containing the answer details.
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
const addAnswer = async (qid: string, ans: Answer): Promise<PopulatedDatabaseAnswer> => {
  const data = { qid, ans };

  const res = await api.post(`${ANSWER_API_URL}/addAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while creating a new answer');
  }

  const question = await api.get(`${QUESTION_API_URL}/getQuestionSilent/${qid}`);

  if (!('error' in question.data)) {
    const notiToAdd = {
      notiSource: String(qid),
      type: 'answer',
      preview: `${ans.text.substring(0, 50)}${ans.text.length > 50 ? '...' : ''}`,
      notiFrom: ans.ansBy,
    };

    question.data.subscriptions.map(async (s: Subscription) => {
      if (s.subscriber !== ans.ansBy) {
        await api.post(`${NOTIFICATION_API_URL}/addNotification`, {
          notificationToAdd: { ...notiToAdd, notiTo: s.subscriber },
        });
      }
    });
  }

  return res.data;
};

export default addAnswer;
