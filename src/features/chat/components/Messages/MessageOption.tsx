import React, { useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";

interface MessageOptionProps {
  messageId: number;       
  message: string;
  link: boolean;
  createdAt: string;
  isMine: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onReply?: () => void;
}

const MessageOption: React.FC<MessageOptionProps> = ({
  messageId,
  message,
  link,
  createdAt,
  isMine,
  onEdit,
  onDelete,
  onCopy,
  onReply
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const renderMessageContent = () => {
    return link ? (
      <a href={message} target="_blank" rel="noopener noreferrer" className="linkMensagem">
        {message}
      </a>
    ) : (
      <span>{message}</span>
    );
  };

  return (
    <div className={`message-container ${menuOpen ? 'active' : ''}`}>
      <div className="message-content">{renderMessageContent()}</div>
      <div className="horaMensagem">
        <span>
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div 
        className="options-container" 
        onMouseLeave={() => setMenuOpen(false)}
      >
        <IoIosArrowDown onClick={handleToggleMenu} style={{ cursor: 'pointer' }} />
        {menuOpen && (
          <div className="dropdown-menu">
            <button
              onClick={() => {
                onReply && onReply();
                setMenuOpen(false);
              }}
            >
              Responder
            </button>
            <button
              onClick={() => {
                onCopy && onCopy();
                setMenuOpen(false);
              }}
            >
              Copiar
            </button>
            {isMine && (
              <>
                <button
                  onClick={() => {
                    onEdit && onEdit();
                    setMenuOpen(false);
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete && onDelete();
                    setMenuOpen(false);
                  }}
                >
                  Excluir
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageOption;
