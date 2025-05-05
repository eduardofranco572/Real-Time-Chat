import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../config';
import { ChatItem } from '../features/ContactList';
import { fetchContactsService, RawContact } from '../services/contactsService';

const socket = io(API_URL);

const useContacts = (idUser: number | string | null) => {
  const [items, setItems] = useState<ChatItem[]>([]);

  const fetchContacts = useCallback(async () => {
    if (!idUser) return;

    try {
      const lista: RawContact[] = await fetchContactsService(idUser);
      const mapped: ChatItem[] = lista.map(i => ({
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
