import { useState, useEffect } from 'react';

export interface ContactInfo {
  nome: string;
  email: string;
  img?: string;
  nomeContato: string;
  imageUrl: string;
  descricao: string;
}

const useContactInfo = (selectedContactId: number | null, idUser: number | null) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

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

  return contactInfo;
};

export default useContactInfo;
