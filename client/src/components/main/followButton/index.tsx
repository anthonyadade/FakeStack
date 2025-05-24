// client/questionPage/followButton/index.tsx
import React, { useEffect, useState } from 'react';
import useUserContext from '../../../hooks/useUserContext';
import { createSubscription, removeSubscription } from '../../../services/subscriptionService';
import './index.css';

interface FollowButtonProps {
  questionId: string;
  initialFollowed?: boolean;
  initialSubscriptionId?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  questionId,
  initialFollowed,
  initialSubscriptionId,
}) => {
  const { user } = useUserContext();
  const [followed, setFollowed] = useState(initialFollowed);
  const [subscriptionId, setSubscriptionId] = useState<string | undefined>(initialSubscriptionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFollowed(initialFollowed);
  }, [initialFollowed]);

  useEffect(() => {
    setSubscriptionId(initialSubscriptionId);
  }, [initialSubscriptionId]);

  const toggleFollow = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    try {
      if (followed) {
        if (!subscriptionId) {
          setError('Subscription not found.');
          return;
        }
        await removeSubscription(subscriptionId);
        setFollowed(false);
        setSubscriptionId(undefined);
      } else {
        const sub = await createSubscription(questionId, user.username, 'thread');
        // Assuming the response returns a subscription with an _id
        setSubscriptionId(sub._id.toString());
        setFollowed(true);
      }
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <div className='follow-button-container'>
      <button className='follow-button' onClick={toggleFollow}>
        {followed ? 'Unfollow' : 'Follow'}
      </button>
      {error && <div className='error-message'>{error}</div>}
    </div>
  );
};

export default FollowButton;
