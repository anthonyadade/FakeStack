import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseNotification } from '@fake-stack-overflow/shared';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';
import NotificationCard from '../main/notificationCard';
import useNotifications from '../../hooks/useNotifications';
import { markNotificationRead } from '../../services/notificationService';
import NotificationPopup from '../main/notificationPopup';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  // Get notifications data from the hook (which fetches from the API)
  const { notifications, newNotifications } = useNotifications();
  const unreadNotifications = notifications.some((noti: DatabaseNotification) => !noti.read);

  // Local state just to show/hide a static dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  // Toggle our dropdown open/close
  const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Create a ref for the notification container
  const notificationContainerRef = useRef<HTMLDivElement>(null);

  // This function checks if a click occurred outside the notification container
  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationContainerRef.current &&
      !notificationContainerRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  // Attach the event listener when the dropdown is open
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    // Cleanup listener on unmount or when showDropdown changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Function to mark a notification as read
  const markAsRead = async (id: string) => {
    await markNotificationRead(id);
  };

  // Determine the content for the notifications list without nesting ternaries
  let notificationsContent;
  if (notifications.length === 0) {
    notificationsContent = <p className='no-notifications'>No new notifications</p>;
  } else {
    notificationsContent = notifications.slice(0, 3).map(noti => (
      <NotificationCard
        key={String(noti._id)}
        notification={noti}
        onMarkAsRead={() => {
          markAsRead(String(noti._id));
          // Navigate to a detail page
          navigate(
            noti.type === 'message' ? `/messaging/direct-message` : `/question/${noti.notiSource}`,
          );
          setShowDropdown(false);
        }}
      />
    ));
  }

  return (
    <div id='header' className='header'>
      <div></div>
      <div className='title'>Fake Stack Overflow</div>
      <input
        id='searchBar'
        placeholder='Search ...'
        type='text'
        value={val}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSignOut} className='logout-button'>
        Log out
      </button>
      <button
        className='view-profile-button'
        onClick={() => navigate(`/user/${currentUser.username}`)}>
        View Profile
      </button>

      {/* Show the notification icon/button only if user is logged in */}
      {currentUser && (
        <div className='notification-container' ref={notificationContainerRef}>
          <button className='notification-icon-button' onClick={handleNotificationClick}>
            <img
              src={
                showDropdown
                  ? `/images/blackNotification${unreadNotifications ? 'Unread' : ''}.png`
                  : `/images/transparentNotification${unreadNotifications ? 'Unread' : ''}.png`
              }
              alt='Notifications'
              className='notification-icon'
            />
          </button>

          {showDropdown && (
            <div className='notification-dropdown'>
              <div className='dropdown-header'>
                <p className='notifications-title'>Notifications</p>
              </div>
              <div className='notifications-list'>{notificationsContent}</div>

              {/* Add a "View All" button to go to the notifications history page */}
              <button
                onClick={() => {
                  navigate('/notifications');
                  setShowDropdown(false);
                }}
                className='view-all-notifications-button'>
                View All Notifications
              </button>
            </div>
          )}

          {newNotifications.length > 0 && <NotificationPopup notification={newNotifications[0]} />}
        </div>
      )}
    </div>
  );
};

export default Header;

// <a target="_blank" href="https://icons8.com/icon/82754/notification">Notification</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
