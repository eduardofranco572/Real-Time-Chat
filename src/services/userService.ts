import { API_URL } from '../config'

export interface UserData {
  nome: string
  descricao: string
  imageUrl: string
}

export async function getUserDataService(
  idUser: number | string
): Promise<UserData> {
  const res = await fetch(`${API_URL}/api/contacts/InfoUser`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUser }),
  })
  const json = await res.json()
  if (!res.ok || json.message !== 'ok') {
    throw new Error(json.error || `Erro ao buscar dados do usuário: ${res.status}`)
  }
  return {
    nome: json.nome,
    descricao: json.descricao,
    imageUrl: json.imageUrl || '',
  }
}

export async function updateUserDataService(params: {
  idUser: string
  nome: string
  descricao: string
  imageFile?: File
}): Promise<void> {
  const form = new FormData()
  form.append('idUser', params.idUser)
  form.append('nome', params.nome)
  form.append('descricao', params.descricao)
  if (params.imageFile) form.append('img', params.imageFile)

  const res = await fetch(`${API_URL}/api/contacts/UpdateUser`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    throw new Error(`Erro ao atualizar usuário: ${res.status}`)
  }
}
