import { useState, useEffect, useCallback } from 'react';

import io from 'socket.io-client';
const socket = io('http://localhost:3000');

interface Contact {
  id: number;
  nomeContato: string;
  imageUrl: string;
}

const useContacts = (idUser: number | string | null) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = useCallback(async () => {
    if (!idUser) return;

    const dataJSON = JSON.stringify({ idUser });

    try {
      const response = await fetch('http://localhost:3000/api/contacts/PegaContatos', {
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

  useEffect(() => {
    if (!idUser) return;

    const handleNewMsg = (newMessage: any) => {
      fetchContacts();
    };

    socket.on('newMessage', handleNewMsg);
    return () => {
      socket.off('newMessage', handleNewMsg);
    };
  }, [idUser, fetchContacts]);

  return { contacts, fetchContacts };
}

export default useContacts;
