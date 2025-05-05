import { API_URL } from '../../../config'

export interface AddGroupParams {
  idUser: number
  groupName: string
  participantIds: number[]
  imageFile?: File
}

export async function addGroupService({
  idUser,
  groupName,
  participantIds,
  imageFile,
}: AddGroupParams): Promise<void> {
  const form = new FormData()
  form.append('idUser', String(idUser))
  form.append('nomeGrupo', groupName)
  form.append('participantIds', JSON.stringify(participantIds))

  if (imageFile) form.append('imgGrupo', imageFile)

  const res = await fetch(`${API_URL}/api/group/addGroup`, {
    method: 'POST',
    body: form,
  })
  
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Falha ao criar grupo')
  }
}
