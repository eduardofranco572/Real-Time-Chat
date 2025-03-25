import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import MessageOption from './MessageOption';
import EditMessagePopup from './EditMessagePopup';

interface Message {
  id: number;
  idUser: number;
  idContato: number;
  mensagem: string;
  link: boolean;
  createdAt: string;
  replyTo?: number | null;
  nomeUsuario?: string; 
}

interface MessageListProps {
  currentUserId: number;
  contactId: number;
  onReplyMessage?: (message: Message) => void;
}

const socket = io('http://localhost:3000');

const MessageList: React.FC<MessageListProps> = ({ currentUserId, contactId, onReplyMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);

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

  const handleEditMessage = (messageId: number, currentText: string) => {
    setEditingMessage({ id: messageId, text: currentText });
  };

  const handleCopyMessage = (messageText: string) => {
    navigator.clipboard.writeText(messageText)
      .then(() => {
        console.log("Texto copiado com sucesso!");
      })
      .catch((err) => {
        console.error("Erro ao copiar texto: ", err);
      });
  };
  
  const handleDeleteMessage = async (messageId: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat/excluirMensagem', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessages(prevMessages => prevMessages.filter(m => m.id !== messageId));
      } else {
        console.error("Erro ao excluir mensagem:", data.error);
      }
    } catch (error) {
      console.error("Erro na requisição de exclusão:", error);
    }
  };

  const handleSaveMessage = (newText: string) => {
    if (editingMessage) {
      fetch('http://localhost:3000/api/chat/editarMensagem', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingMessage.id, message: newText })
      })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === editingMessage.id ? { ...msg, mensagem: newText } : msg
          )
        );
        setEditingMessage(null);
      })
      .catch(error => console.error("Erro ao editar mensagem:", error));
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
        let repliedMessage;
        if (message.replyTo) {
          repliedMessage = messages.find(m => m.id === message.replyTo);
        }
        return (
          <div
            key={message.id}
            className={`message ${isMyMessage ? 'my-message' : 'contact-message'}`}
          >
            {repliedMessage && (
              <div className="replied-message-box">
                <strong>
                  {repliedMessage.nomeContato ? repliedMessage.nomeContato : 'Você'} 
                </strong>
                <span>{repliedMessage.mensagem}</span>
              </div>
            )}

            <MessageOption
              messageId={message.id}
              message={message.mensagem}
              link={message.link}
              createdAt={message.createdAt}
              isMine={isMyMessage}
              onCopy={() => handleCopyMessage(message.mensagem)}
              onReply={() => onReplyMessage && onReplyMessage(message)}
              onEdit={() => handleEditMessage(message.id, message.mensagem)}
              onDelete={() => handleDeleteMessage(message.id)}
            />
          </div> 
        );
      })}

      {editingMessage && (
        <EditMessagePopup
          initialMessage={editingMessage.text}
          onSave={handleSaveMessage}
          onClose={() => setEditingMessage(null)}
        />
      )}
    </div>
  );
};

export default MessageList;