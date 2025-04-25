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

const useGroupData = (idChat?: number) => {
  const [groupData, setGroupData] = useState<GroupData>({
    nome: '',
    descricaoGrupo: '',
    imgUrl: defaultImg,
  })

  const fetchGroupData = useCallback(async () => {
    if (!idChat) return
    try {
      const res = await fetch(`${API_URL}/api/chat/getGroupInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idChat }),
      })
      if (!res.ok) throw new Error(res.statusText)

      const data = await res.json()
      const nome = data.group.nome || ''
      const descricao = data.group.descricao || ''
      const imgUrl = data.group.imageUrl || defaultImg

      setGroupData({ nome, descricaoGrupo: descricao, imgUrl })
    } catch (err) {
      console.error('Erro ao buscar grupo:', err)
    }
  }, [idChat])

  useEffect(() => {
    fetchGroupData()
  }, [fetchGroupData])

  useEffect(() => {
    const onGroupUpdated = (data: { idChat: number; nomeGrupo?: string; descricaoGrupo?: string }) => {
      if (data.idChat !== idChat) return
      fetchGroupData()
    }

    socket.on('groupUpdated', onGroupUpdated)
    return () => {
      socket.off('groupUpdated', onGroupUpdated)
    }
  }, [idChat, fetchGroupData])

  const updateGroupData = useCallback(
    async ({ descricaoGrupo, nomeGrupo, imageFile }: {
      descricaoGrupo?: string
      nomeGrupo?: string
      imageFile?: File
    }) => {
      if (!idChat) return

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
    [idChat, fetchGroupData]
  )

  const addParticipants = useCallback(
    async (participantIds: number[]) => {
      if (!idChat || participantIds.length === 0) return
      try {
        const res = await fetch(`${API_URL}/api/chat/addParticipant`, {
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
    [idChat, fetchGroupData]
  )

  const leaveGroup = useCallback(
    async (idUser: number) => {
      if (!idChat) return
      try {
        const res = await fetch(`${API_URL}/api/chat/leaveGroup`, {
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
    [idChat, fetchGroupData]
  )

  return { groupData, updateGroupData, addParticipants, leaveGroup }
}

export default useGroupData
