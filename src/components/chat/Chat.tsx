import React, { useEffect, useState } from 'react';
import { IoMdMore, IoMdClose, IoMdSend } from "react-icons/io";
import { MdAdd } from "react-icons/md";
import { AiFillAudio } from "react-icons/ai";
import MessageList from './MessageList'; 
import { IoClose } from 'react-icons/io5';

interface Message {
  id: number;
  idUser: number;
  idContato: number;
  mensagem: string;
  link: boolean;
  createdAt: string;
  replyTo?: number | null;
  nomeContato?: string; // Novo campo vindo do backend, se existir
}

interface ChatProps {
  selectedContactId: number | null;
  showContactDetails: boolean;
  setShowContactDetails: (visible: boolean) => void;
  idUser: number | null; 
}

interface ContactInfo {
  nome: string;
  email: string;
  img?: string;
  nomeContato: string;
  imageUrl: string;
  descricao: string;
}

const Chat: React.FC<ChatProps> = ({ selectedContactId, showContactDetails, setShowContactDetails, idUser }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [message, setMessage] = useState<string>('');
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!selectedContactId || !idUser) return;

    const fetchContactInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/contacts/InfoContato', {
          method: 'POST',
          body: JSON.stringify({ idUser, idContato: selectedContactId }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const result = await response.json();
  
        if (result.message === 'ok') {
          setContactInfo({
            ...result,
            imageUrl: result.imageUrl || '',
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, [selectedContactId, idUser]);

  const handleHideDetails = () => {
    setShowContactDetails(false);
  };

  const handleReplyMessage = (message: Message) => {
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

        <section className="footerChat">
          <div className="infoFC">
            <div className="topico2">
              <MdAdd/>
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