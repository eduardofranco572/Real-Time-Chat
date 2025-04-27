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
  imageUrl?: string;
}

export type SetMessages = React.Dispatch<React.SetStateAction<Message[]>>;

const socket = io(`${API_URL}`);

const useMessages = (currentChatId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Carregar mensagens iniciais
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
        console.error('Erro ao buscar mensagens:', err);
      }
    })();
  }, [currentChatId]);

  //Escutar novas mensagens
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

  useEffect(() => {
    if (!currentChatId) return;

    const handleDeleted = ({ id }: { id: number }) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    };

    const handleUpdated = ({ id, message }: { id: number; message: string }) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === id ? { ...m, mensagem: message } : m
        )
      );
    };

    socket.on('messageDeleted', handleDeleted);
    socket.on('messageUpdated', handleUpdated);

    return () => {
      socket.off('messageDeleted', handleDeleted);
      socket.off('messageUpdated', handleUpdated);
    };
  }, [currentChatId]);

  return { messages, setMessages };
};

export default useMessages;
