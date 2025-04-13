import React, { useState } from 'react';
import MessageOption from './MessageOption';
import EditMessagePopup from './EditMessagePopup';
import { Message } from '../../hooks/chatHooks/useMessages';
import ImageModal from './ImageModal';
import { SiGoogledocs } from 'react-icons/si';
import { MdDownloading } from 'react-icons/md';

interface MessageListProps {
  currentUserId: number;
  contactId: number;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onReplyMessage?: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  currentUserId,
  contactId,
  messages,
  setMessages,
  onReplyMessage
}) => {
  const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleEditMessage = (messageId: number, currentText: string) => {
    setEditingMessage({ id: messageId, text: currentText });
  };

  const handleCopyMessage = (messageText: string) => {
    navigator.clipboard.writeText(messageText)
      .then(() => console.log("Texto copiado com sucesso!"))
      .catch((err) => console.error("Erro ao copiar texto: ", err));
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
        setMessages(prev => prev.filter(m => m && m.id !== messageId));
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
        setMessages(prev =>
          prev.map(msg =>
            msg && msg.id === editingMessage.id ? { ...msg, mensagem: newText } : msg
          )
        );
        setEditingMessage(null);
      })
      .catch(error => console.error("Erro ao editar mensagem:", error));
    }
  };

  return (
    <div className="message-list">
      {messages.filter(message => message).map((message) => {
        const isMyMessage = Number(message.idUser) === currentUserId;
        const repliedMessage =
          message.replyTo && message.replyTo !== 0 
            ? messages.find(m => m && m.id === message.replyTo)
            : null;

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

            {message.mediaUrl && (
              <div className="media-content">
                {message.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video controls src={message.mediaUrl + `?t=${Date.now()}`} />
                ) : message.mediaUrl.match(/\.(pdf|doc|docx|txt)$/i) ? (
                  <div className="documentMessage">
                    <div className='documentMessageIcon'>
                      <SiGoogledocs />
                      <p>{message.nomeDocs || 'Documento'}</p>
                    </div>
                    <a
                      href={`${message.mediaUrl}`}
                      download={message.nomeDocs || 'Documento'}
                    >
                      <MdDownloading />
                    </a>
                  </div>
                ) : (
                  <img
                    src={message.mediaUrl + `?t=${Date.now()}`}
                    alt="Conteúdo Anexo"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedImage(message.mediaUrl)}
                  />
                )}
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
                  
      {selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

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
