import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../config'
import {
  getGroupInfoService,
  updateGroupService,
  addParticipantsService,
  leaveGroupService,
  GroupData
} from '../services/groupService'

const socket = io(API_URL)

const useGroupData = (
  idChat?: number,
  isGroup: boolean = false
) => {
  const [groupData, setGroupData] = useState<GroupData>({
    nome: '',
    descricao: '',
    imageUrl: '',
    members: []
  })

  const fetchGroupData = useCallback(async () => {
    if (!idChat || !isGroup) return
    try {
      const data = await getGroupInfoService(idChat)
      setGroupData({
        nome: data.nome,
        descricao: data.descricao,
        imageUrl: data.imageUrl,
        members: data.members
      })
    } catch (err) {
      console.error('Erro ao buscar grupo:', err)
    }
  }, [idChat, isGroup])

  useEffect(() => {
    fetchGroupData()
  }, [fetchGroupData])

  useEffect(() => {
    if (!isGroup) return
    const onGroupUpdated = (payload: { idChat: number }) => {
      if (payload.idChat !== idChat) return
      fetchGroupData()
    }

    socket.on('groupUpdated', onGroupUpdated)
    return () => {
      socket.off('groupUpdated', onGroupUpdated)
    }
  }, [idChat, isGroup, fetchGroupData])

  const updateGroupData = useCallback(
    async (args: {
      descricaoGrupo?: string
      nomeGrupo?: string
      imageFile?: File
    }) => {
      if (!idChat || !isGroup) return
      try {
        await updateGroupService({ idChat, ...args })
        await fetchGroupData()
      } catch (err) {
        console.error('Erro ao atualizar grupo:', err)
      }
    },
    [idChat, isGroup, fetchGroupData]
  )

  const addParticipants = useCallback(
    async (participantIds: number[]) => {
      if (!idChat || !isGroup || participantIds.length === 0) return
      try {
        await addParticipantsService(idChat, participantIds)
        await fetchGroupData()
      } catch (err) {
        console.error('Erro ao adicionar participantes:', err)
      }
    },
    [idChat, isGroup, fetchGroupData]
  )

  const leaveGroup = useCallback(
    async (idUser: number) => {
      if (!idChat || !isGroup) return
      try {
        await leaveGroupService(idChat, idUser)
        await fetchGroupData()
      } catch (err) {
        console.error('Erro ao sair do grupo:', err)
      }
    },
    [idChat, isGroup, fetchGroupData]
  )

  return { groupData, updateGroupData, addParticipants, leaveGroup }
}

export default useGroupData
