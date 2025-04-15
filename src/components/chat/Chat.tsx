import React, { useState } from 'react';
import { IoMdMore, IoMdClose, IoMdSend } from "react-icons/io";
import { MdAdd } from "react-icons/md";
import { AiFillAudio } from "react-icons/ai";
import { IoClose } from 'react-icons/io5';
import { IoDocumentText } from "react-icons/io5";
import { IoMdPhotos } from "react-icons/io";
import MessageList from './MessageList'; 
import ChatMediaUploader from './ChatMediaUploader';
import ChatDocsUploader from './ChatDocsUploader'; 
import useContactInfo from '../../hooks/chatHooks/useContactInfo';
import useMessages from '../../hooks/chatHooks/useMessages';
import { useChatHandlers } from '../../hooks/chatHooks/useChatHandlers';

interface ChatProps {
  selectedContactId: number | null;
  showContactDetails: boolean;
  setShowContactDetails: (visible: boolean) => void;
  idUser: number | null; 
}

const Chat: React.FC<ChatProps> = ({ selectedContactId, showContactDetails, setShowContactDetails, idUser }) => {
  const [message, setMessage] = useState<string>('');
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const [showAddCard, setShowAddCard] = useState<boolean>(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showDocsUploader, setShowDocsUploader] = useState(false);

  const contactInfo = useContactInfo(selectedContactId, idUser);
  const { messages, setMessages } = useMessages(idUser as number, selectedContactId as number);
  const { handleSendMessage, handleSendMedia, handleSendDocs } = useChatHandlers();

  const handleHideDetails = () => {
    setShowContactDetails(false);
  };

  const handleReplyMessage = (message: any) => {
    setReplyingMessage(message);
  };

  const onSendMessage = async () => {
    if (idUser && selectedContactId) {
      await handleSendMessage({
        idUser,
        selectedContactId,
        message,
        replyingMessage,
        setMessage,
        setReplyingMessage,
      });
    }
  };

  const onSendMedia = async (file: File, caption: string) => {
    if (idUser && selectedContactId) {
      await handleSendMedia({ idUser, selectedContactId, file, caption });
    }
  };

  const onSendDocs = async (file: File, caption: string) => {
    if (idUser && selectedContactId) {
      await handleSendDocs({ idUser, selectedContactId, file, caption });
    }
  };

  if (!contactInfo) {
    return <div>Loading contact info...</div>;
  }

  return (
    <section className='chat-container'>
      <div className='alinhaCO'>
        <section className='headerChat'>
          <div className='infosChat'>
            <div className='IconeContatoChat' onClick={() => setShowContactDetails(!showContactDetails)}>
              <img src={contactInfo.imageUrl} alt={contactInfo.nome} />
            </div>
            <div className='infosContatoChat'>
              <h1>{contactInfo.nomeContato}</h1>
              <p>{contactInfo.descricao}</p>
            </div>
          </div>
          <div className='opcoesChat'>
            <IoMdMore />
          </div>  
        </section>

        <section className='Chat'>
          {idUser && selectedContactId && (
            <MessageList
              currentUserId={idUser}
              contactId={selectedContactId}
              messages={messages}
              setMessages={setMessages}
              onReplyMessage={handleReplyMessage}
            />
          )}
        </section>

        {replyingMessage && (
          <div className="reply-box">
            <div className="mensagemReply">
              <strong>
                {replyingMessage.nomeContato ? replyingMessage.nomeContato : 'Você'}
              </strong>
              <span>{replyingMessage.mensagem}</span>
            </div>
            <button className='btnCloseReply' onClick={() => setReplyingMessage(null)}>
              <IoClose />
            </button>
          </div>
        )}

        {showMediaUploader && (
          <ChatMediaUploader
            onSendMedia={onSendMedia}
            onClose={() => setShowMediaUploader(false)}
          />
        )}

        {showDocsUploader && (
          <ChatDocsUploader
            onSendMedia={onSendDocs}
            onClose={() => setShowDocsUploader(false)}
          />
        )}

        <section className="footerChat">
          <div className="infoFC">
            <div className="topico2-container" style={{ position: 'relative' }}>
              {showAddCard && (
                <div className="add-options-card">
                  <div className="itensAddOptions">
                    <button onClick={() => {
                      setShowDocsUploader(true);
                      setShowAddCard(false);
                    }}>
                      <IoDocumentText />
                      Documentos
                    </button>
                    <button onClick={() => {
                      setShowMediaUploader(true);
                      setShowAddCard(false);
                    }}>
                      <IoMdPhotos />
                      Fotos e Vídeos
                    </button>
                  </div>
                </div>
              )}
              <div className="topico2" onClick={() => setShowAddCard(prev => !prev)}>
                <MdAdd />
              </div>
            </div>
            <input
              className="inputinfosFC"
              type="text"
              name="mensagem"
              placeholder="Digite uma mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSendMessage();
                }
              }}
            />
            <div className="topico2">
              <AiFillAudio />
              <IoMdSend onClick={onSendMessage} />
            </div>
          </div>
        </section>

      </div>
      {showContactDetails && (
        <div className='DadosContato'>
          <div className='bodyDC'>
            <div className='headerDC'>
              <h1>Dados do contato</h1>
              <button onClick={handleHideDetails}><IoMdClose /></button>
            </div>
            <div className='infosDC'>
              <div className='detalhesUser'>
                <img src={contactInfo.imageUrl} alt={contactInfo.nomeContato} />
                <h1>{contactInfo.nomeContato}</h1>
                <p>{contactInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Chat;
