import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../../config'

export interface UserInfo {
  id: number
  nome: string
  imageUrl: string
}

export interface ChatInfoBase {
  id: number
  nome: string
  descricao: string
  imageUrl: string
}

export interface OneToOneInfo extends ChatInfoBase {
  isGroup: false
  email: string
}

export interface GroupInfo extends ChatInfoBase {
  isGroup: true
  members: UserInfo[]
}

type ChatInfo = OneToOneInfo | GroupInfo | null

const socket = io(API_URL)

const useChatInfo = (
  selectedChatId: number | null,
  idUser: number | null,
  isGroup: boolean
): ChatInfo => {
  const [chatInfo, setChatInfo] = useState<ChatInfo>(null)

  const fetchChatInfo = useCallback(async () => {
    if (selectedChatId == null || (!isGroup && idUser == null)) {
      console.warn('useChatInfo: parâmetros insuficientes')
      return
    }

    try {
      const endpoint = isGroup
        ? `${API_URL}/api/chat/getGroupInfo`
        : `${API_URL}/api/chat/getChatInfo`

      const body = isGroup
        ? { idChat: selectedChatId }
        : { idChat: selectedChatId, idUser }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Erro ${res.status}: ${txt}`)
      }

      const data = await res.json()
      if (data.message !== 'ok') {
        console.error('API retornou erro:', data.error)
        return
      }

      if (isGroup) {
        const gi: GroupInfo = {
          id: data.group.id,
          nome: data.group.nome,
          descricao: data.group.descricao,
          imageUrl: data.group.imageUrl,
          isGroup: true,
          members: data.members.map((m: any) => ({
            id: m.id,
            nome: m.nome,
            imageUrl: m.imageUrl,
          })),
        }
        setChatInfo(gi)
      } else {
        const oi: OneToOneInfo = {
          id: data.id,
          nome: data.nomeContato,
          descricao: data.descricao,
          imageUrl: data.imageUrl,
          isGroup: false,
          email: data.email!,
        }
        setChatInfo(oi)
      }
    } catch (err) {
      console.error('Erro ao buscar chat info:', err)
    }
  }, [selectedChatId, idUser, isGroup])

  useEffect(() => {
    fetchChatInfo()
  }, [fetchChatInfo])

  useEffect(() => {
    const onGroupUpdated = (data: { idChat: number }) => {
      if (isGroup && data.idChat === selectedChatId) {
        fetchChatInfo()
      }
    }

    socket.on('groupUpdated', onGroupUpdated)
    return () => {
      socket.off('groupUpdated', onGroupUpdated)
    }
  }, [selectedChatId, isGroup, fetchChatInfo])

  return chatInfo
}

export default useChatInfo
