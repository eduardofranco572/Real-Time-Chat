import { useState, useEffect, useCallback } from 'react';

const useContacts = (idUser: string | null) => {
  const [contacts, setContacts] = useState<{ nomeContato: string }[]>([]);

  const fetchContacts = useCallback(async () => {
    if (!idUser) return;

    const dataJSON = JSON.stringify({ idUser });

    try {
      const response = await fetch('http://localhost:3000/PegaContatos', {
        method: 'POST',
        body: dataJSON,
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();

      if (result.message === 'ok') {
        setContacts(result.contatos || []);
      }
    } catch (error) {
      console.error('Erro ao buscar contatos: ', error);
    }
  }, [idUser]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, fetchContacts };
}

export default useContacts;
