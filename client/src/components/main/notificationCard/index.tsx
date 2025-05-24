import React from 'react';
import './index.css';
import { DatabaseNotification } from '../../../types/types';

interface NotificationCardProps {
  notification: DatabaseNotification;
  onMarkAsRead: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onMarkAsRead }) => (
  <div className='notification-card' onClick={onMarkAsRead}>
    <div className='notification-title'>
      New {notification.type} from {notification.notiFrom}
    </div>
    <div className='notification-summary'>{notification.preview}</div>
    <span className='notification-time'>
      {new Date(notification.notiDateTime).toLocaleString('en-US', {
        weekday: 'long', // Monday, Tuesday, etc.
        year: 'numeric',
        month: 'long', // January, February, etc.
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true, // Use 12-hour clock (AM/PM)
      })}
    </span>
    <br />
    <img
      src={notification.read ? '/images/open-envelope.png' : '/images/closed-envelope.png'}
      alt='Envelope'
      className='notification-envelope-icon'
      onClick={e => {
        e.stopPropagation(); // Prevent the card's onClick from firing twice
        onMarkAsRead();
      }}
    />
  </div>
);

export default NotificationCard;
