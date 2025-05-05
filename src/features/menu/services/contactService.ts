import { API_URL } from '../../../config'

export interface AddContactParams {
  idUser: number
  email: string
  nome: string
}

export async function addContactService({
  idUser,
  email,
  nome,
}: AddContactParams): Promise<void> {
  const res = await fetch(`${API_URL}/api/contacts/addcontato`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUser, email, nome }),
  })

  const json = await res.json()
  
  if (!res.ok || !json.idChat) {
    throw new Error(json.error || 'Falha ao adicionar contato')
  }
}
