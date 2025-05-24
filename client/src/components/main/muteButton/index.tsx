// client/directMessage/muteButton/index.tsx
import React, { useEffect, useState } from 'react';
import useUserContext from '../../../hooks/useUserContext';
import { createSubscription, removeSubscription } from '../../../services/subscriptionService';
import './index.css';

interface MuteButtonProps {
  chatId: string;
  initialMuted?: boolean;
  initialSubscriptionId?: string;
}

const MuteButton: React.FC<MuteButtonProps> = ({ chatId, initialMuted, initialSubscriptionId }) => {
  const { user } = useUserContext();
  const [muted, setMuted] = useState(initialMuted);
  const [subscriptionId, setSubscriptionId] = useState<string | undefined>(initialSubscriptionId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMuted(initialMuted);
  }, [initialMuted]);

  useEffect(() => {
    setSubscriptionId(initialSubscriptionId);
  }, [initialSubscriptionId]);

  const toggleMute = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    try {
      if (!muted) {
        if (!subscriptionId) {
          setError('Subscription not found.');
          return;
        }
        await removeSubscription(subscriptionId);
        setMuted(true);
        setSubscriptionId(undefined);
      } else {
        const sub = await createSubscription(chatId, user.username, 'chat');
        setSubscriptionId(sub._id.toString());
        setMuted(false);
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
    <div className='mute-button-container'>
      <button className='mute-button' onClick={toggleMute}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
      {error && <div className='error-message'>{error}</div>}
    </div>
  );
};

export default MuteButton;
