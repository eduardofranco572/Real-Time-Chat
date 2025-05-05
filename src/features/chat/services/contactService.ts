import { API_URL } from '../../../config'

export async function removeContact(userId: number, contactId: number) {
  const res = await fetch(`${API_URL}/api/contacts/removeContato`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUser: userId, idContato: contactId })
  })
  if (!res.ok) throw new Error('Erro ao remover contato')
}