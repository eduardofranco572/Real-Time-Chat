import { useCallback } from 'react';

const useAddContact = (idUser: number | null, fetchContacts: () => void) => {
    const addContact = useCallback(async (email: string, nome: string) => {
        if (!idUser) {
            alert('Usuário não autenticado');
            return;
        }

        const dataJSON = JSON.stringify({
            email,
            nome,
            idUser,
        });

        try {
            const response = await fetch('http://localhost:3000/api/contacts/addcontato', {
            method: 'POST',
            body: dataJSON,
            headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (result.message === 'ok') {
            fetchContacts();
            } else {
            alert('Erro');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário: ', error);
        }
    }, [idUser, fetchContacts]);

  return addContact;
};

export default useAddContact;
