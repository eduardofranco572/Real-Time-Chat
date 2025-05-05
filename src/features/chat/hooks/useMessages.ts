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

  const socket = useRef(io(API_URL)).current;

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

    setMessages(prev =>[ ...older.filter(o => !prev.some(p => p.id === o.id)), ...prev ]);

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

    const handler = (msg: Message) => {
      if ( msg.idChat === chatId && !messages.some(m => m.id === msg.id)) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('newMessage', handler);

    return () => {
      socket.off('newMessage', handler);
    };
  }, [chatId, socket, messages]);

  return {
    messages,
    hasMore,
    loadMore: fetchMore,
    setMessages
  };
}
