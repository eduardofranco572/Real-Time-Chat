import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

export interface ContactInfo {
  nome: string;
  email?: string;
  nomeContato: string;
  imageUrl: string;
  descricao: string;
  id: number;
}

const useChatInfo = (
  selectedChatId: number | null,
  idUser: number | null,
  isGroup: boolean
) => {
  const [chatInfo, setChatInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    if (selectedChatId == null || (!isGroup && idUser == null)) {
      console.warn('useChatInfo: selectedChatId ou idUser não fornecido');
      return;
    }

    const fetchChatInfo = async () => {
      try {
        const endpoint = isGroup
          ? `${API_URL}/api/chat/getGroupInfo`
          : `${API_URL}/api/chat/getChatInfo`;

        const body = isGroup
          ? { idChat: selectedChatId }
          : { idChat: selectedChatId, idUser };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
            nomeContato: result.nome,
            imageUrl: result.imageUrl,
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
  }, [selectedChatId, idUser, isGroup]);

  return chatInfo;
};

export default useChatInfo;
