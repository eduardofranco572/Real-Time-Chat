import React, { useEffect, useState } from 'react';
import { IoMdMore } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

interface ChatProps {
  selectedContactId: number | null;
  showContactDetails: boolean;
  setShowContactDetails: (visible: boolean) => void;
}

interface ContactInfo {
  nome: string;
  descricao: string;
  imageUrl: string;
  email: string;
}

const Chat: React.FC<ChatProps> = ({ selectedContactId, showContactDetails, setShowContactDetails }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    if (!selectedContactId) return;

    const fetchContactInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/InfoUser', {
          method: 'POST',
          body: JSON.stringify({ idUser: selectedContactId }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (result.message === 'ok') {
          setContactInfo({
            nome: result.nome,
            descricao: result.descricao || 'No description available',
            imageUrl: result.imageUrl || '',
            email : result.email 
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, [selectedContactId]);

  const handleHideDetails = () => {
    setShowContactDetails(false);
  };

  if (!contactInfo) {
    return <div>Loading contact info...</div>;
  }

  return (
    <div className='chat-container'>
      <div className='headerChat'>
        <div className='infosChat'>
          <div className='IconeContatoChat' onClick={() => setShowContactDetails(!showContactDetails)}>
            <img src={contactInfo.imageUrl} alt={contactInfo.nome} />
          </div>
          <div className='infosContatoChat'>
            <h1>{contactInfo.nome}</h1>
            <p>{contactInfo.descricao}</p>
          </div>
        </div>
        <div className='opcoesChat'>
          <IoMdMore />
        </div>  
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
                  <img src={contactInfo.imageUrl} alt={contactInfo.nome} />
                  <h1>{contactInfo.nome}</h1>
                  <p>{contactInfo.email}</p>
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
