import { useCallback } from 'react';
import { API_URL } from '../../config';

interface UseSelectContactArgs {
  idUser: number | null;
  onSelectContact: (chatId: number) => void;
}

const useSelectContact = ({ idUser, onSelectContact }: UseSelectContactArgs) => {
  const selectContact = useCallback(
    async (idContato: number) => {
      if (!idUser) return;
      try {
        const response = await fetch(
          `${API_URL}/api/contacts/getChatForContact`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUser, idContato }),
          }
        );
        const result = await response.json();
        if (result.idChat) {
          onSelectContact(result.idChat);
        } else {
          console.error('Erro ao obter idChat:', result.error);
        }
      } catch (error) {
        console.error('Erro na requisição do chat:', error);
      }
    },
    [idUser, onSelectContact]
  );

  return selectContact;
};

export default useSelectContact;
