import React from 'react';
import './index.css';
import { DatabaseNotification } from '../../../types/types';

interface NotificationPopupProps {
  notification: DatabaseNotification;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification }) => (
  <div className='notification-popup'>
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
  </div>
);

export default NotificationPopup;
