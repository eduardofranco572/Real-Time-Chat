import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '../types';
import { getMessages } from '../services/chatService';
import io from 'socket.io-client';
import { API_URL } from '../../../config';

export default function useMessages(
  chatId: number | null,
  initialLimit = 20
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const beforeIdRef = useRef<number | null>(null);

  const socketRef = useRef(io(API_URL));

  const fetchInitial = useCallback(async () => {
    if (!chatId) return;

    const {
      messages: msgs,
      hasMore: more
    } = await getMessages({
      chatId,
      limit: initialLimit
    });

    setMessages(msgs);
    setHasMore(more);

    beforeIdRef.current = msgs.length
      ? Math.min(...msgs.map(m => m.id))
      : null;
  }, [chatId, initialLimit]);

  const fetchMore = useCallback(async () => {
    if (!chatId || beforeIdRef.current == null) return;

    const {
      messages: older,
      hasMore: more
    } = await getMessages({
      chatId,
      limit: initialLimit,
      beforeId: beforeIdRef.current
    });

    setMessages(prev => [
      ...older.filter(o => !prev.some(p => p.id === o.id)),
      ...prev
    ]);

    setHasMore(more);

    beforeIdRef.current = Math.min(
      beforeIdRef.current,
      ...older.map(o => o.id)
    );
  }, [chatId, initialLimit]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    if (!chatId) return;

    const socket = socketRef.current;

    const handleNewMessage = (msg: Message) => {
      if (msg.idChat === chatId && !messages.some(m => m.id === msg.id)) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleDeleted = (payload: { id: number }) => {
      setMessages(prev => prev.filter(m => m.id !== payload.id));
    };

    const handleUpdated = (payload: { id: number; message: string }) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === payload.id ? { ...m, mensagem: payload.message } : m
        )
      );
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleDeleted);
    socket.on('messageUpdated', handleUpdated);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleDeleted);
      socket.off('messageUpdated', handleUpdated);
    };
  }, [chatId, messages]);

  return {
    messages,
    hasMore,
    loadMore: fetchMore,
    setMessages
  };
}
