import { useState, useEffect } from 'react';

export interface ContactInfo {
  nome: string;
  email: string;
  nomeContato: string;
  imageUrl: string;
  descricao: string;
  id: number;
}

const useChatInfo = (selectedChatId: number | null, idUser: number | null) => {
  const [chatInfo, setChatInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    if (selectedChatId == null || idUser == null) {
      console.warn('useChatInfo: selectedChatId ou idUser não fornecido');
      return;
    }

    const fetchChatInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/chat/getChatInfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idChat: selectedChatId, idUser }),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Status ${response.status}: ${text}`);
        }
        const result = await response.json();
        if (result.message === 'ok') {
          setChatInfo({
            nome: result.nome,
            email: result.email,
            nomeContato: result.nomeContato,
            imageUrl: result.imageUrl || '',
            descricao: result.descricao,
            id: result.id,
          });
        } else {
          console.error('Erro no chat info:', result.error);
        }
      } catch (error) {
        console.error('Erro ao buscar chat info:', error);
      }
    };

    fetchChatInfo();
  }, [selectedChatId, idUser]);

  return chatInfo;
};

export default useChatInfo;
