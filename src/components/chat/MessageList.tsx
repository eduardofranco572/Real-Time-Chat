import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface Message {
  id: number;
  idUser: number;
  idContato: number;
  mensagem: string;
  createdAt?: string;
}

interface MessageListProps {
  currentUserId: number;
  contactId: number;
}

const socket = io('http://localhost:3000');

const MessageList: React.FC<MessageListProps> = ({ currentUserId, contactId }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Função para buscar as mensagens existentes
  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/chat/getMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser: currentUserId, idContato: contactId }),
      });
      const result = await response.json();
      setMessages(result.messages);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentUserId, contactId]);

  useEffect(() => {
    socket.on('newMessage', (newMessage: Message) => {
      if (
        (newMessage.idUser === currentUserId && newMessage.idContato === contactId) ||
        (newMessage.idUser === contactId && newMessage.idContato === currentUserId)
      ) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [currentUserId, contactId]);

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isMyMessage = message.idUser === currentUserId;
        return (
          <div
            key={message.id}
            className={`message ${isMyMessage ? 'my-message' : 'contact-message'}`}
          >
            <span>{message.mensagem}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
