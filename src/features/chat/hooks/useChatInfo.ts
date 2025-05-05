import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../../../config'
import { getChatInfo } from '../services/chatService'
import { ChatInfo } from '../types'

const socket = io(API_URL)

export default function useChatInfo(
  chatId: number | null,
  userId: number | null,
  isGroup: boolean
): ChatInfo | null {
  const [info, setInfo] = useState<ChatInfo | null>(null)

  const fetchInfo = useCallback(async () => {
    if (!chatId || (!isGroup && userId == null)) return
    try {
      const data = await getChatInfo({ chatId, userId, isGroup })
      setInfo(data)
    } catch (err) {
      console.error('Erro ao buscar info do chat:', err)
    }
  }, [chatId, userId, isGroup])

  useEffect(() => { fetchInfo() }, [fetchInfo])

  useEffect(() => {
    if (!chatId) return

    const handleGroupUpdated = (payload: { idChat: number | string }) => {
      const updatedId = typeof payload.idChat === 'string' ? Number(payload.idChat) : payload.idChat
      if (updatedId === chatId) {
        fetchInfo()
      }
    }

    const handleChatUpdated = (payload: { idChat: number | string }) => {
      const updatedId = typeof payload.idChat === 'string' ? Number(payload.idChat) : payload.idChat
      console.log('[useChatInfo] chatUpdated payload idChat:', updatedId)
      if (updatedId === chatId) {
        fetchInfo()
      }
    }

    socket.on('groupUpdated', handleGroupUpdated)
    socket.on('chatUpdated', handleChatUpdated)

    return () => {
      socket.off('groupUpdated', handleGroupUpdated)
      socket.off('chatUpdated', handleChatUpdated)
    }
  }, [chatId, fetchInfo])

  return info
}
