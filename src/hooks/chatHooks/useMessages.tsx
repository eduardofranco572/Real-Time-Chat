import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../../config';

export interface Message {
  id: number;
  idChat: number;
  idUser: number;
  mensagem: string;
  link: boolean;
  createdAt: string;
  replyTo?: number | null;
  nomeContato?: string;
  mediaUrl?: string;
  nomeDocs?: string;
}

const socket = io(`${API_URL}`);

const useMessages = (currentChatId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!currentChatId) return;
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/chat/getMessages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idChat: currentChatId }),
          }
        );
        const result = await res.json();
        if (result.messages) {
          setMessages(result.messages as Message[]);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [currentChatId]);

  useEffect(() => {
    if (!currentChatId) return;

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.idChat !== currentChatId) return;
      setMessages(prev =>
        prev.some(m => m.id === newMessage.id)
          ? prev
          : [...prev, newMessage]
      );
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [currentChatId]);

  return { messages, setMessages };
};

export default useMessages;