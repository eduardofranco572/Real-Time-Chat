import { deleteMessage as delMsg, editMessage as edtMsg } from '../services/messageService'
import { useCallback } from 'react'
import { Message } from '../types'

export default function useMessageActions(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const deleteMessage = useCallback(async (id: number) => {
    await delMsg(id)
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [setMessages])

  const editMessage = useCallback(async (id: number, text: string) => {
    await edtMsg(id, text)
    setMessages(prev => prev.map(m => m.id===id ? { ...m, mensagem: text } : m))
  }, [setMessages])

  return { deleteMessage, editMessage }
}