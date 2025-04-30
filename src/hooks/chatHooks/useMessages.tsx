import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../../config';

export interface Message {
  id: number;
  idChat: number;
  idUser: number;
  mensagem: string;
  link: boolean;
  createdAt: string;
  replyTo?: number | null;
  nomeContato?: string;
  mediaUrl?: string;
  nomeDocs?: string;
  imageUrl?: string;
}

export type SetMessages = React.Dispatch<React.SetStateAction<Message[]>>;

const socket = io(API_URL);

interface UseMessagesReturn {
  messages: Message[];
  setMessages: SetMessages;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}

const useMessages = (
  currentChatId: number | null,
  initialLimit = 20
): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const beforeIdRef = useRef<number | null>(null);

  const fetchInitial = useCallback(async () => {
    if (!currentChatId) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/getMessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idChat: currentChatId, limit: initialLimit }),
      });
      const result = await res.json();
      if (!result.messages) return;

      setMessages(result.messages);
      setHasMore(result.hasMore);

      const ids = (result.messages as Message[]).map(m => m.id);
      const minId = ids.length ? Math.min(...ids) : null;
      
      beforeIdRef.current = minId;
    } catch (err) {
      console.error('Erro ao buscar mensagens iniciais:', err);
    }
  }, [currentChatId, initialLimit]);

  const fetchMore = useCallback(async () => {
    if (!currentChatId || beforeIdRef.current === null) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/getMessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idChat: currentChatId,
          limit: initialLimit,
          beforeId: beforeIdRef.current,
        }),
      });
      const result = await res.json();
      if (!result.messages) return;

      setMessages(prev => {
        const únicos = (result.messages as Message[]).filter(
          m => !prev.some(x => x.id === m.id)
        );
        return [...únicos, ...prev];
      });
      setHasMore(result.hasMore);

      const newIds = (result.messages as Message[]).map(m => m.id);
      beforeIdRef.current = Math.min(beforeIdRef.current, ...newIds);
    } catch (err) {
      console.error('Erro ao buscar mais mensagens:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentChatId, initialLimit]);

  useEffect(() => {
    beforeIdRef.current = null;
    setHasMore(true);
    fetchInitial();
  }, [currentChatId, fetchInitial]);

  // tempo real
  useEffect(() => {
    if (!currentChatId) return;
    const handleNew = (newMessage: Message) => {
      if (newMessage.idChat !== currentChatId) return;
      setMessages(prev =>
        prev.some(m => m.id === newMessage.id)
          ? prev
          : [...prev, newMessage]
      );
    };
    socket.on('newMessage', handleNew);
    return () => {
      socket.off('newMessage', handleNew);
    };
  }, [currentChatId]);

  return {
    messages,
    setMessages,
    hasMore,
    loadingMore,
    loadMore: fetchMore,
  };
};

export default useMessages;
