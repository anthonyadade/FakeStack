import { useState, useEffect, useRef } from 'react';
import { DatabaseNotification, NotifCreatePayload, NotifUpdatePayload } from '../types/types';
import { getNotificationsByUser } from '../services/notificationService';
import useUserContext from './useUserContext';

const sortNotifications = (notifications: DatabaseNotification[]) => {
  if (!notifications || notifications.length === 0) return [];
  return notifications.sort(
    (b: DatabaseNotification, a: DatabaseNotification) =>
      new Date(a.notiDateTime).getTime() - new Date(b.notiDateTime).getTime(),
  );
};

const useNotifications = () => {
  const { user, socket } = useUserContext();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const notificationsRef = useRef<DatabaseNotification[]>([]);
  const [newNotifications, setNewNotifications] = useState<DatabaseNotification[]>([]);

  useEffect(() => {
    const fetchNotis = async () => {
      if (!user.username) return;
      const notis = await getNotificationsByUser(user.username);
      setNotifications(() => sortNotifications(notis));
    };

    fetchNotis();
    notificationsRef.current = notifications;
  }, [user.username, notifications]);

  useEffect(() => {
    const handleNotiUpdate = (notiUpdate: NotifUpdatePayload) => {
      const noti = notiUpdate.notification;
      if (noti && noti.notiTo === user.username) {
        const updatedNotis: DatabaseNotification[] = sortNotifications([
          ...notificationsRef.current.filter((n: DatabaseNotification) => n._id !== noti._id),
          noti,
        ]);

        setNotifications(updatedNotis);
      }
    };

    const handleNotiCreate = (notiCreate: NotifCreatePayload) => {
      const noti = notiCreate.notification;
      if (noti && noti.notiTo === user.username) {
        setNotifications(prevNotis => [noti, ...prevNotis]);
        setNewNotifications(prevNotis => [...prevNotis, noti]);
      }
    };

    socket.on('notificationUpdate', handleNotiUpdate);
    socket.on('notificationCreate', handleNotiCreate);

    return () => {
      socket.off('notificationUpdate', handleNotiUpdate);
      socket.off('notificationCreate', handleNotiCreate);
    };
  }, [socket, user.username]);

  useEffect(() => {
    setTimeout(() => {
      if (newNotifications.length > 0) {
        const newNewNotifications = newNotifications.slice(1);
        setNewNotifications(newNewNotifications);
      }
    }, 10000);
  }, [newNotifications]);

  return { notifications, newNotifications };
};

export default useNotifications;
