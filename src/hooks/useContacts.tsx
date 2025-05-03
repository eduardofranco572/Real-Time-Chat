import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../config';
import { ChatItem } from '../components/ContactList';

const socket = io(API_URL);

interface RawContact {
  id: number;
  nome: string;
  imageUrl: string;
  mensagem?: string;
  mediaUrl?: string;
  lastMessageAt?: string;
  chatId: number;
  isGroup: boolean;
  lastSenderName?: string;
}

const useContacts = (idUser: number | string | null) => {
  const [items, setItems] = useState<ChatItem[]>([]);

  const fetchContacts = useCallback(async () => {
    if (!idUser) return;

    try {
      const response = await fetch(
        `${API_URL}/api/contacts/PegaContatos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUser }),
        }
      );
      const { message, lista }: { message: string; lista: RawContact[] } = await response.json();

      if (message === 'ok' && Array.isArray(lista)) {
        const uniqueLista = lista.reduce<RawContact[]>((acc, item) => {
          if (!acc.some(x => x.chatId === item.chatId)) {
            acc.push(item);
          }
          return acc;
        }, []);

        const mapped: ChatItem[] = uniqueLista.map(i => ({
          id: i.id,
          nome: i.nome,
          imageUrl: i.imageUrl,
          mensagem: i.mensagem,
          mediaUrl: i.mediaUrl,
          lastMessageAt: i.lastMessageAt,
          chatId: i.chatId,
          isGroup: !!i.isGroup,
          lastSenderName: i.lastSenderName || '',
        }));

        setItems(mapped);
      }
    } catch (error) {
      console.error('Erro ao buscar contatos e grupos:', error);
    }
  }, [idUser]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (!idUser) return;

    const handlers: Record<string, (data?: any) => void> = {
      newMessage: () => fetchContacts(),
      newGroup: () => fetchContacts(),
      groupUpdated: () => fetchContacts(),
      contactRemoved: data => {
        if (data.idUser?.toString() === idUser.toString()) {
          fetchContacts();
        }
      },
      newContact: data => {
        const userStr = idUser.toString();
        if (
          data.idUser?.toString() === userStr ||
          data.idContato?.toString() === userStr
        ) {
          fetchContacts();
        }
      },
    };

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
    return () => {
      Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn));
    };
  }, [idUser, fetchContacts]);

  return { items, fetchContacts };
};

export default useContacts;
