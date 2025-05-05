import { API_URL } from '../config'

export interface RawContact {
  id: number
  nome: string
  imageUrl: string
  mensagem?: string
  mediaUrl?: string
  lastMessageAt?: string
  chatId: number
  isGroup: boolean
  lastSenderName?: string
}

export async function fetchContactsService(
  idUser: number | string
): Promise<RawContact[]> {
  const res = await fetch(`${API_URL}/api/contacts/PegaContatos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUser }),
  })

  const json = await res.json()
  
  if (!res.ok || json.message !== 'ok' || !Array.isArray(json.lista)) {
    throw new Error(json.error || `Erro ao buscar contatos: ${res.status}`)
  }

  const unique = (json.lista as RawContact[]).reduce<RawContact[]>((acc, item) => {
    if (!acc.some(x => x.chatId === item.chatId)) acc.push(item)
    return acc
  }, [])

  return unique
}
