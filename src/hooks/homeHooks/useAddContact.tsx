import { useCallback } from 'react';
import { API_URL } from '../../config';

const useAddContact = (idUser: number | null, fetchContacts: () => void) => {
    const addContact = useCallback(async (email: string, nome: string) => {
        if (!idUser) {
            alert('Usuário não autenticado');
            return;
        }
        const dataJSON = JSON.stringify({ email, nome, idUser });
        try {
            const response = await fetch(`${API_URL}/api/contacts/addcontato`, {
              method: 'POST',
              body: dataJSON,
              headers: { 'Content-Type': 'application/json' },
            });
  
            const result = await response.json();
            if (result.idChat) {
                fetchContacts();
            } else {
                alert('Erro: ' + result.error || 'Erro inesperado');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário: ', error);
        }
    }, [idUser, fetchContacts]);
  
    return addContact;
  };
  export default useAddContact;
  
