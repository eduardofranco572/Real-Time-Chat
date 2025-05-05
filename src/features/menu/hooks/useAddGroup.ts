import { useCallback } from 'react'
import { addGroupService } from '../services/groupService'

export interface UseAddGroupReturn {
  addGroup: (
    groupName: string,
    imageFile?: File,
    participantIds?: number[]
  ) => Promise<void>
}

export default function useAddGroup(idUser: number | null): UseAddGroupReturn {
  const addGroup = useCallback(
    async (
      groupName: string,
      imageFile?: File,
      participantIds: number[] = []
    ) => {
      if (!idUser) {
        alert('Usuário não autenticado')
        return
      }
      try {
        await addGroupService({ idUser, groupName, participantIds, imageFile })
        alert('Grupo criado com sucesso')
      } catch (err: any) {
        alert('Erro: ' + (err.message || 'desconhecido'))
      }
    },
    [idUser]
  )

  return { addGroup }
}
