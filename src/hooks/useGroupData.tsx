import { useState, useCallback, useEffect } from 'react'
import { API_URL } from '../config'
import { io } from 'socket.io-client'

export interface GroupData {
  nome: string
  descricaoGrupo: string
  imgUrl: string
}

const defaultImg = '/assets/img/grupoPadrao.svg'
const socket = io(API_URL)

const useGroupData = (
  idChat?: number,
  isGroup: boolean = false
) => {
  const [groupData, setGroupData] = useState<GroupData>({
    nome: '',
    descricaoGrupo: '',
    imgUrl: defaultImg,
  })

  const fetchGroupData = useCallback(async () => {
    if (!idChat || !isGroup) return
    try {
      const res = await fetch(`${API_URL}/api/group/getGroupInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idChat }),
      })
      if (!res.ok) throw new Error(res.statusText)

      const data = await res.json()
      const nome = data.group?.nome || ''
      const descricao = data.group?.descricao || ''
      const imgUrl = data.group?.imageUrl || defaultImg

      setGroupData({ nome, descricaoGrupo: descricao, imgUrl })
    } catch (err) {
      console.error('Erro ao buscar grupo:', err)
    }
  }, [idChat, isGroup])

  useEffect(() => {
    fetchGroupData()
  }, [fetchGroupData])

  useEffect(() => {
    if (!isGroup) return
    const onGroupUpdated = (data: { idChat: number; nomeGrupo?: string; descricaoGrupo?: string }) => {
      if (data.idChat !== idChat) return
      fetchGroupData()
    }

    socket.on('groupUpdated', onGroupUpdated)
    return () => {
      socket.off('groupUpdated', onGroupUpdated)
    }
  }, [idChat, isGroup, fetchGroupData])

  const updateGroupData = useCallback(
    async ({ descricaoGrupo, nomeGrupo, imageFile }: {
      descricaoGrupo?: string
      nomeGrupo?: string
      imageFile?: File
    }) => {
      if (!idChat || !isGroup) return

      try {
        const form = new FormData()
        form.append('idChat', idChat.toString())
        if (descricaoGrupo != null) form.append('descricaoGrupo', descricaoGrupo)
        if (nomeGrupo != null) form.append('nomeGrupo', nomeGrupo)
        if (imageFile != null) form.append('imgGrupo', imageFile)

        const res = await fetch(`${API_URL}/api/group/UpdateGroup`, {
          method: 'POST',
          body: form,
        })
        if (!res.ok) throw new Error(res.statusText)

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
        const res = await fetch(`${API_URL}/api/group/addParticipant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idChat, participantIds }),
        })
        if (!res.ok) throw new Error(res.statusText)

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
        const res = await fetch(`${API_URL}/api/group/leaveGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idChat, idUser }),
        })

        if (!res.ok) throw new Error('Erro ao sair do grupo')
        
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