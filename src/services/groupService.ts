import { API_URL } from '../config'

export interface Member {
  id: number
  nome: string
  imageUrl: string
}

export interface GroupData {
  nome: string
  descricao: string
  imageUrl: string
  members: Member[]
}

export async function getGroupInfoService(
  idChat: number
): Promise<GroupData> {
  const res = await fetch(`${API_URL}/api/group/getGroupInfo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idChat }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || `Erro ao buscar grupo: ${res.status}`)
  }

  const grp = json.group || {}
  const mems = Array.isArray(json.members) ? json.members : []

  return {
    nome: grp.nome || '',
    descricao: grp.descricao || '',
    imageUrl: grp.imageUrl || '',
    members: mems.map((m: any) => ({
      id: m.id,
      nome: m.nome,
      imageUrl: m.imageUrl,
    })),
  }
}

export async function updateGroupService(params: {
  idChat: number
  nomeGrupo?: string
  descricaoGrupo?: string
  imageFile?: File
}): Promise<void> {
  const form = new FormData()

  form.append('idChat', params.idChat.toString())
  if (params.nomeGrupo) form.append('nomeGrupo', params.nomeGrupo)
  if (params.descricaoGrupo) form.append('descricaoGrupo', params.descricaoGrupo)
  if (params.imageFile) form.append('imgGrupo', params.imageFile)

  const res = await fetch(`${API_URL}/api/group/UpdateGroup`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Erro ao atualizar grupo: ${res.status}`)
  }
}

export async function addParticipantsService(
  idChat: number,
  participantIds: number[]
): Promise<void> {
  const res = await fetch(`${API_URL}/api/group/addParticipant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idChat, participantIds }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Erro ao adicionar participantes: ${res.status}`)
  }
}

export async function leaveGroupService(
  idChat: number,
  idUser: number
): Promise<void> {
  const res = await fetch(`${API_URL}/api/group/leaveGroup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idChat, idUser }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Erro ao sair do grupo: ${res.status}`)
  }
}
