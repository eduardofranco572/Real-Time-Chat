import { useCallback, useState } from 'react'
import {
  sendText as sendTextService,
  sendMedia as sendMediaService,
  sendDocs as sendDocsService
} from '../services/chatService'

export default function useSendMessage() {
  const [sending, setSending] = useState(false)

  const sendText = useCallback(async (
    chatId: number,
    userId: number,
    text: string,
    replyTo?: number
  ) => {
    if (!text.trim()) return
    setSending(true)
    try {
      await sendTextService({ chatId, userId, text, replyTo })
    } finally {
      setSending(false)
    }
  }, [])

  const sendMedia = useCallback(async (
    chatId: number,
    userId: number,
    file: File,
    caption: string
  ) => {
    setSending(true)
    try {
      await sendMediaService({ chatId, userId, file, caption })
    } finally {
      setSending(false)
    }
  }, [])

  const sendDocs = useCallback(async (
    chatId: number,
    userId: number,
    file: File,
    caption: string
  ) => {
    setSending(true)
    try {
      await sendDocsService({ chatId, userId, file, caption })
    } finally {
      setSending(false)
    }
  }, [])

  return { sendText, sendMedia, sendDocs, sending }
}