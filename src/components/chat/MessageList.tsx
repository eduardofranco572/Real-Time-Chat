import React, { useState } from 'react';
import { Message, SetMessages } from '../../hooks/chatHooks/useMessages';
import MessageOption from './MessageOption';
import EditMessagePopup from './EditMessagePopup';
import ImageModal from './ImageModal';
import { SiGoogledocs } from 'react-icons/si';
import { MdDownloading } from 'react-icons/md';
import useMessageActions from '../../hooks/chatHooks/useMessageActions';

// @ts-expect-error ignorar img
import iconePadrao from '../../assets/img/iconePadrao.svg';

interface MessageListProps {
  currentUserId: number;
  isGroup: boolean;
  messages: Message[];
  setMessages: SetMessages;
  onReplyMessage?: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  currentUserId,
  isGroup,
  messages,
  setMessages,
  onReplyMessage
}) => {
  const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { deleteMessage, editMessage } = useMessageActions(setMessages);

  const handleEditMessage = (messageId: number, currentText: string) => {
    setEditingMessage({ id: messageId, text: currentText });
  };

  const handleCopyMessage = (messageText: string) => {
    navigator.clipboard.writeText(messageText)
      .then(() => console.log("Texto copiado com sucesso!"))
      .catch((err) => console.error("Erro ao copiar texto: ", err));
  };

  const handleDeleteMessage = (id: number) => deleteMessage(id);

  const handleSaveMessage = (newText: string) => {
    if (editingMessage) {
      editMessage(editingMessage.id, newText);
      setEditingMessage(null);
    }
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const isMyMessage = message.idUser === currentUserId;
        const prev = messages[index - 1];
        const isContinuation = !!prev && prev.idUser === message.idUser;
        
        const repliedMessage =
          message.replyTo && message.replyTo !== 0
            ? messages.find(m => m.id === message.replyTo)
            : null;

        return (
          <div
            key={message.id}
            className={[
              "message-wrapper",
              isMyMessage ? "my" : "contact",
              isContinuation ? "continued" : ""
            ].join(" ")}
          >
            {isGroup && !isMyMessage && !isContinuation && (
              <img
                src={message.imageUrl ?? iconePadrao}
                alt={message.nomeContato}
                className="avatar"
              />
            )}

            <div
              className={[
                "message",
                isMyMessage ? "my-message" : "contact-message",
                isContinuation ? "continued" : ""
              ].join(" ")}
            >
              {isGroup && !isMyMessage && !isContinuation && (
                <span className="sender-name">{message.nomeContato}</span>
              )}

              {repliedMessage && (
                <div className="replied-message-box">
                  <strong>
                    {repliedMessage.idUser === currentUserId
                      ? 'Você'
                      : repliedMessage.nomeContato}
                  </strong>
                  <span>{repliedMessage.mensagem}</span>
                </div>
              )}

              {message.mediaUrl && (
                <div className="media-content">
                  {message.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video controls src={`${message.mediaUrl}?t=${Date.now()}`} />
                  ) : message.mediaUrl.match(/\.(pdf|doc|docx|txt)$/i) ? (
                    <div className="documentMessage">
                      <div className="documentMessageIcon">
                        <SiGoogledocs />
                        <p>{message.nomeDocs || 'Documento'}</p>
                      </div>
                      <a href={message.mediaUrl} download={message.nomeDocs || 'Documento'}>
                        <MdDownloading />
                      </a>
                    </div>
                  ) : (
                    <img
                      src={`${message.mediaUrl}?t=${Date.now()}`}
                      alt="Conteúdo Anexo"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedImage(message.mediaUrl!)}
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
