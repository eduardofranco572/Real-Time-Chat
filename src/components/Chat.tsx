import React, { useEffect, useState } from 'react';

interface ChatProps {
  selectedContactId: number | null;
}

interface ContactInfo {
  nome: string;
  descricao: string;
  imageUrl: string;
}

const Chat: React.FC<ChatProps> = ({ selectedContactId }) => {
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
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, [selectedContactId]);

  if (!contactInfo) {
    return <div>Loading contact info...</div>;
  }

  return (
    <div className='chat-container'>
      <img src={contactInfo.imageUrl} alt={contactInfo.nome} />
      <h1>{contactInfo.nome}</h1>
      <p>{contactInfo.descricao}</p>
    </div>
  );
};

export default Chat;
