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
import useContactInfo, { ContactInfo } from '../../hooks/chatHooks/useContactInfo';
import useMessages from '../../hooks/chatHooks/useMessages';

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

  const handleHideDetails = () => {
    setShowContactDetails(false);
  };

  const handleReplyMessage = (message: any) => {
    setReplyingMessage(message);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !idUser || !selectedContactId) return;
  
    try {
      const response = await fetch('http://localhost:3000/api/chat/salvarMensagem', {
        method: 'POST',
        body: JSON.stringify({
          idUser,
          idContato: selectedContactId,
          message,
          replyTo: replyingMessage ? replyingMessage.id : null,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const result = await response.json();
      if (result.message === 'Mensagem enviada com sucesso') {
        setMessage('');
        setReplyingMessage(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendMedia = async (file: File, caption: string) => {
    const formData = new FormData();
    formData.append('mediaChat', file);
    formData.append('legenda', caption);
    formData.append('idUser', idUser?.toString() || '');
    formData.append('idContato', selectedContactId?.toString() || '');
    formData.append('message', caption);
  
    try {
      const response = await fetch('http://localhost:3000/api/chat/salvarMensagemMedia', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, result.newMessage]);
      } else {
        alert('Erro ao enviar mensagem: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleSendDocs = async (file: File, caption: string) => {
    const formData = new FormData();
    formData.append('mediaChat', file);
    formData.append('legenda', caption);
    formData.append('idUser', idUser?.toString() || '');
    formData.append('idContato', selectedContactId?.toString() || '');
    formData.append('message', caption);
    formData.append('nomeDocs', file.name);
  
    try {
      const response = await fetch('http://localhost:3000/api/chat/salvarDocument', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const result = await response.json();
        alert('Erro ao enviar documento: ' + (result.error || 'Erro desconhecido'));
      }

    } catch (error) {
      console.error('Erro ao enviar documento:', error);
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
            onSendMedia={handleSendMedia}
            onClose={() => setShowMediaUploader(false)}
          />
        )}

        {showDocsUploader && (
          <ChatDocsUploader
            onSendMedia={handleSendDocs}
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
                <MdAdd/>
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
                  handleSendMessage();
                }
              }}
            />
            <div className="topico2">
              <AiFillAudio/>
              <IoMdSend onClick={handleSendMessage} />
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
