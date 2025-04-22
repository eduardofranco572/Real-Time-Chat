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
import useChatInfo from '../../hooks/chatHooks/useChatInfo'; 
import useMessages from '../../hooks/chatHooks/useMessages';
import { useChatHandlers } from '../../hooks/chatHooks/useChatHandlers';

interface ChatProps {
  selectedChatId: number;
  showContactDetails: boolean;
  setShowContactDetails: React.Dispatch<React.SetStateAction<boolean>>;
  idUser: number | null;
  selectedChatIsGroup: boolean; 
}

const Chat: React.FC<ChatProps> = ({ selectedChatId, showContactDetails, setShowContactDetails, idUser, selectedChatIsGroup}) => {
  if (idUser == null) {
    return <div>Carregando usuário…</div>;
  }
  if (selectedChatId == null) {
    return <div>Selecione um chat para começar.</div>;
  }

  const [message, setMessage] = useState<string>('');
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const [showAddCard, setShowAddCard] = useState<boolean>(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showDocsUploader, setShowDocsUploader] = useState(false);

  const chatInfo = useChatInfo(selectedChatId, idUser, selectedChatIsGroup);
  
  const { messages, setMessages } = useMessages(selectedChatId);
  const { handleSendMessage, handleSendMedia, handleSendDocs } = useChatHandlers();

  if (!chatInfo) {
    return <div>Loading chat info...</div>;
  }

  const handleHideDetails = () => {
    setShowContactDetails(false);
  };

  const handleReplyMessage = (message: any) => {
    setReplyingMessage(message);
  };

  const onSendMessage = async () => {
    await handleSendMessage({
      idUser,
      idChat: selectedChatId, 
      message,
      replyingMessage,
      setMessage,
      setReplyingMessage,
    });
  };

  const onSendMedia = async (file: File, caption: string) => {
    await handleSendMedia({ idUser, idChat: selectedChatId, file, caption });
  };

  const onSendDocs = async (file: File, caption: string) => {
    await handleSendDocs({ idUser, idChat: selectedChatId, file, caption });
  };

  return (
    <section className='chat-container'>
      <div className='alinhaCO'>
        <section className='headerChat'>
          <div className='infosChat'>
            <div className='IconeContatoChat' onClick={() => setShowContactDetails(!showContactDetails)}>
              <img src={chatInfo.imageUrl} alt={chatInfo.nome} />
            </div>
            <div className='infosContatoChat'>
              <h1>{chatInfo.nome}</h1>
              <p>{chatInfo.descricao}</p>
            </div>
          </div>
          <div className='opcoesChat'>
            <IoMdMore />
          </div>  
        </section>

        <section className='Chat'>
          <MessageList
            isGroup={selectedChatIsGroup}
            currentUserId={idUser}
            messages={messages}
            setMessages={setMessages}
            onReplyMessage={handleReplyMessage}
          />
        </section>

        {replyingMessage && (
          <div className="reply-box">
            <div className="mensagemReply">
              <strong>
                {replyingMessage.idUser === idUser
                  ? 'Você'
                  : replyingMessage.nomeContato}
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
              <h1>Dados do Chat</h1>
              <button onClick={handleHideDetails}><IoMdClose /></button>
            </div>
            <div className='infosDC'>
              <div className='detalhesUser'>
                <img src={chatInfo.imageUrl} alt={chatInfo.nome} />
                <h1>{chatInfo.nome}</h1>
                <p>{chatInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Chat;