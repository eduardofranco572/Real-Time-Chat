// src/hooks/useContacts.ts
import { useState, useEffect, useCallback } from 'react'
import io from 'socket.io-client'
import { API_URL } from '../config'
import { ChatItem } from '../components/ContactList'

const socket = io(API_URL)

const useContacts = (idUser: number | string | null) => {
  const [items, setItems] = useState<ChatItem[]>([])

  const fetchContacts = useCallback(async () => {
    if (!idUser) return

    try {
      const response = await fetch(
        `${API_URL}/api/contacts/PegaContatos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUser }),
        }
      )
      const { message, lista } = await response.json()
      if (message === 'ok') {
        setItems(
          lista.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            imageUrl: item.imageUrl,
            mensagem: item.mensagem,
            mediaUrl: item.mediaUrl,
            lastMessageAt: item.lastMessageAt,
            chatId: item.chatId,
            isGroup: !!item.isGroup,
            lastSenderName: item.lastSenderName || '',
          }))
        )
      }
    } catch (error) {
      console.error('Erro ao buscar contatos e grupos:', error)
    }
  }, [idUser])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    if (!idUser) return
    const handleNew = () => fetchContacts()
    socket.on('newMessage', handleNew)
    return () => {
      socket.off('newMessage', handleNew)
    }
  }, [idUser, fetchContacts])

  useEffect(() => {
    if (!idUser) return
    const handleGroupUpdated = () => {
      fetchContacts()
    }
    socket.on('groupUpdated', handleGroupUpdated)
    return () => {
      socket.off('groupUpdated', handleGroupUpdated)
    }
  }, [idUser, fetchContacts])

  return { items, fetchContacts }
}

export default useContacts
