import { ObjectId } from 'mongodb';
import { useEffect, useState } from 'react';
import {
  ChatUpdatePayload,
  Message,
  PopulatedDatabaseChat,
  SafeDatabaseUser,
} from '../types/types';
import useUserContext from './useUserContext';
import { createChat, getChatById, getChatsByUser, sendMessage } from '../services/chatService';
import { updateMessage } from '../services/messageService';
import { getUserSubscriptionId } from '../services/subscriptionService';

/**
 * useDirectMessage is a custom hook that provides state and functions for direct messaging between users.
 * It includes a selected user, messages, and a new message state.
 */

const useDirectMessage = () => {
  const { user, socket } = useUserContext();
  const [showCreatePanel, setShowCreatePanel] = useState<boolean>(false);
  const [chatToCreate, setChatToCreate] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<PopulatedDatabaseChat | null>(null);
  const [chats, setChats] = useState<PopulatedDatabaseChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | undefined>(undefined);

  const handleJoinChat = (chatID: ObjectId) => {
    socket.emit('joinChat', String(chatID), user.username);
  };

  const handleChatSelect = async (chatID: ObjectId | undefined) => {
    if (!chatID) {
      setError('Invalid chat ID');
      return;
    }

    const chat = await getChatById(chatID);
    setSelectedChat(chat);
    handleJoinChat(chatID);
  };

  const handleUserSelect = (selectedUser: SafeDatabaseUser) => {
    if (user.username === selectedUser.username) return;
    if (!chatToCreate.includes(selectedUser.username)) {
      setChatToCreate([...chatToCreate, selectedUser.username]);
    } else {
      setChatToCreate(chatToCreate.filter(username => username !== selectedUser.username));
    }
  };

  const handleCreateChat = async () => {
    if (!chatToCreate) {
      setError('Please select a user to chat with');
      return;
    }

    const chat = await createChat([user.username, ...chatToCreate]);
    setSelectedChat(chat);
    handleJoinChat(chat._id);
    setShowCreatePanel(false);
    setChatToCreate([]);
  };

  useEffect(() => {
    const fetchChats = async () => {
      const userChats = await getChatsByUser(user.username);
      setChats(userChats);
    };

    const handleChatUpdate = async (chatUpdate: ChatUpdatePayload) => {
      const { chat, type } = chatUpdate;
      switch (type) {
        case 'created': {
          if (chat.participants.includes(user.username)) {
            setChats(prevChats => [chat, ...prevChats]);
          }
          return;
        }
        case 'newMessage': {
          const recentMessage = chat.messages[chat.messages.length - 1];
          recentMessage.readBy.push(user.username);
          await updateMessage(recentMessage);
          setSelectedChat(chat);
          return;
        }
        case 'newParticipant': {
          if (chat.participants.includes(user.username)) {
            setChats(prevChats => {
              if (prevChats.some(c => chat._id === c._id)) {
                return prevChats.map(c => (c._id === chat._id ? chat : c));
              }
              return [chat, ...prevChats];
            });
          }
          return;
        }
        case 'newViewer': {
          if (chat._id === selectedChat?._id) {
            const updatedChat = await getChatById(chat._id);
            setSelectedChat(updatedChat);
          }
          return;
        }
        default: {
          setError('Invalid chat update type');
        }
      }
    };

    fetchChats();

    socket.on('chatUpdate', handleChatUpdate);

    return () => {
      socket.off('chatUpdate', handleChatUpdate);
      socket.emit('leaveChat', String(selectedChat?._id));
    };
  }, [user.username, socket, selectedChat?._id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat?._id) {
      const message: Omit<Message, 'type'> = {
        msg: newMessage,
        msgFrom: user.username,
        msgDateTime: new Date(),
        readBy: [],
      };

      const chat = await sendMessage(message, selectedChat._id);

      const updatedChat = await getChatById(chat._id);
      setSelectedChat(updatedChat);
      setError(null);
      setNewMessage('');
    } else {
      setError('Message cannot be empty');
    }
  };

  useEffect(() => {
    /**
     * Function to check if user is subscribed to this question.
     */
    const fetchSubscriptionId = async () => {
      try {
        if (!selectedChat) return;
        const res: string | undefined = await getUserSubscriptionId(selectedChat, user.username);
        setSubscriptionId(res);
      } catch (e) {
        setError('Error fetching user subscription for this chat');
      }
    };
    fetchSubscriptionId().catch(e => setError(e));
  }, [selectedChat, user.username]);

  return {
    selectedChat,
    chatToCreate,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    error,
    subscriptionId,
  };
};

export default useDirectMessage;
