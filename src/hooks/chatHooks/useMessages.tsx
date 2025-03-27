import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export interface Message {
  id: number;
  idUser: number;
  idContato: number;
  mensagem: string;
  link: boolean;
  createdAt: string;
  replyTo?: number | null;
  nomeContato?: string;
  mediaUrl?: string;
}

const socket = io('http://localhost:3000');

const useMessages = (currentUserId: number, contactId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/chat/getMessages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUser: currentUserId, idContato: contactId }),
        });
        const result = await response.json();
        setMessages(result.messages.filter((m: Message) => m));
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
      }
    };

    fetchMessages();
  }, [currentUserId, contactId]);

  useEffect(() => {
    socket.on('newMessage', (newMessage: Message) => {
      const senderId = Number(newMessage.idUser);
      const receiverId = Number(newMessage.idContato);
      if (
        (senderId === currentUserId && receiverId === contactId) ||
        (senderId === contactId && receiverId === currentUserId)
      ) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [currentUserId, contactId]);

  return { messages, setMessages };
};

export default useMessages;
