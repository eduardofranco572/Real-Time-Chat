import { API_URL } from '../../../config'
import { ChatInfo, Message } from '../types'

export async function getChatInfo(params: { 
  chatId: number;
  userId: number | null; isGroup: boolean 
}): Promise<ChatInfo> {
  const endpoint = params.isGroup
    ? '/api/group/getGroupInfo'
    : '/api/chat/getChatInfo'

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      params.isGroup
        ? { idChat: params.chatId }
        : { idChat: params.chatId, idUser: params.userId }
    )
  })
  const data = await res.json()

  if (!res.ok || data.message !== 'ok') throw new Error(data.error || 'Erro')
    
  return params.isGroup ? data.group : data
}

export async function getMessages(params: { 
  chatId: number; limit:
  number; beforeId?: number | null 
}): Promise<{ messages: Message[]; hasMore: boolean }> {
  const body: any = { idChat: params.chatId, limit: params.limit }

  if (params.beforeId != null) body.beforeId = params.beforeId
  const res = await fetch(`${API_URL}/api/chat/getMessages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })

  return res.json()
}

export async function sendText(params: {
  chatId: number
  userId: number
  text: string
  replyTo?: number
}) {
  const body = {
    idChat: params.chatId,
    idUser: params.userId,
    message: params.text,  
    replyTo: params.replyTo ?? null,   
  }

  const res = await fetch(`${API_URL}/api/chat/salvarMensagem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro ao enviar mensagem')
  }

  return res.json()
}

export async function sendMedia(params: { 
  chatId: number; 
  userId: number; 
  file: File; 
  caption: string; 
  replyTo?: number 
}) {
  const form = new FormData()
  form.append('idChat', String(params.chatId))
  form.append('idUser', String(params.userId))
  form.append('message', params.caption)
  form.append('replyTo', String(params.replyTo ?? ''))
  form.append('mediaChat', params.file)

  const res = await fetch(`${API_URL}/api/chat/salvarMensagemMedia`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro ao enviar mídia')
  }
  return res.json()
}

export async function sendDocs(params: { 
  chatId: number; 
  userId: number; 
  file: File; 
  caption: string; 
  replyTo?: number 
}) {
  const form = new FormData()
  form.append('idChat', String(params.chatId))
  form.append('idUser', String(params.userId))
  form.append('message', params.caption)
  form.append('replyTo', String(params.replyTo ?? ''))
  form.append('mediaChat', params.file)

  const res = await fetch(`${API_URL}/api/chat/salvarDocument`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro ao enviar documento')
  }
  return res.json()
}
