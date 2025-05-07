import { API_URL } from '../../../config'

export interface Status {
  id: number
  idContato: number
  idAutor: number
  nomeContato: string
  imgStatus?: string
  legenda?: string
  [key: string]: any
}

export interface CoverStatus {
  imageUrl: string
}

export async function fetchMyStatusesService(idUser: number): Promise<Status[]> {
  const res = await fetch(`${API_URL}/api/status/getStatus/${idUser}`)
  const data = await res.json()

  if (data.message === 'Nenhum status encontrado') {
    return []
  }

  if (!res.ok || data.message !== 'ok' || !Array.isArray(data.statuses)) {
    throw new Error(data.error || `Erro ao buscar meus statuses: ${res.status}`)
  }

  return data.statuses as Status[]
}

export async function fetchContactStatusesService(
  idContato: number
): Promise<Status[]> {
  const res = await fetch(`${API_URL}/api/status/getUserStatuses/${idContato}`)
  const data = await res.json()

  if (!res.ok || !Array.isArray(data.statuses)) {
    throw new Error(data.error || `Erro ao buscar statuses do contato: ${res.status}`)
  }
  return data.statuses as Status[]
}

export async function fetchCoverStatusService(
  idUser: number
): Promise<CoverStatus | null> {
  const res = await fetch(`${API_URL}/api/status/statusUsuarioCapa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUser }),
  })

  const json = await res.json()
  
  if (!res.ok) throw new Error(json.error || `Status ${res.status}`)

  const defaultIcon = '../assets/img/iconePadrao.svg'
  if (!json.statusImage || json.statusImage === defaultIcon) {
    return null
  }
  return { imageUrl: json.statusImage }
}

export async function fetchUserStatusesService(
  idUser: number
): Promise<Status[]> {
  const res = await fetch(`${API_URL}/api/status/statusUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUser }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Status ${res.status}`)

  if (!Array.isArray(json.statuses))
    throw new Error('Resposta inválida: statuses não é um array')

  return json.statuses as Status[]
}

export async function deleteStatusService(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/status/excluirStatus/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || `Falha ao excluir status ${id}`)
  }
}
