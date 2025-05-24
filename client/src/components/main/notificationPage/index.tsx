import './index.css';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../../hooks/useNotifications';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '../../../services/notificationService';
import useUserContext from '../../../hooks/useUserContext';

const NotificationsHistoryPage: React.FC = () => {
  const { notifications } = useNotifications();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  // Function to mark a notification as read
  const markAsRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const markAllAsRead = async () => {
    await markAllNotificationsRead(currentUser.username);
  };

  return (
    <div className='notifications-history-page'>
      <div className='notification-history-header'>
        <h1>All Notifications</h1>
        <button onClick={markAllAsRead}>Mark all as read...</button>
      </div>
      {notifications &&
        notifications.map(noti => (
          <div
            key={String(noti._id)}
            className='notifications-history-card'
            onClick={e => {
              navigate(
                noti.type === 'message'
                  ? `/messaging/direct-message`
                  : `/question/${noti.notiSource}`,
              );
              markAsRead(String(noti._id));
            }}>
            <h3 className='notifications-history-title'>
              New {noti.type} from {noti.notiFrom}
            </h3>
            <p className='notifications-history-summary'>{noti.preview}</p>
            <span className='notifications-history-time'>
              {new Date(noti.notiDateTime).toLocaleString('en-US', {
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
              src={noti.read ? '/images/open-envelope.png' : '/images/closed-envelope.png'}
              alt='Envelope'
              className='notification-envelope-icon'
            />
          </div>
        ))}
    </div>
  );
};

export default NotificationsHistoryPage;
