import { useState, useCallback, useEffect } from 'react'
import { API_URL } from '../config'

export interface GroupData {
  descricaoGrupo: string
  imgUrl: string
}
const defaultImg = '/assets/img/grupoPadrao.svg'

const useGroupData = (idChat?: number) => {
  const [groupData, setGroupData] = useState<GroupData>({
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
      const descricao = data.group.descricao || ''
      const imgUrl = data.group.imageUrl || defaultImg

      setGroupData({ descricaoGrupo: descricao, imgUrl })
    } catch (err) {
      console.error('Erro ao buscar grupo:', err)
    }
  }, [idChat])

  useEffect(() => {
    fetchGroupData()
  }, [fetchGroupData])

  const updateGroupData = useCallback(
    async ({
      descricaoGrupo,
      imageFile,
    }: {
      descricaoGrupo: string
      imageFile?: File
    }) => {
      if (!idChat) return
      try {
        const form = new FormData()
        form.append('idChat', idChat.toString())
        form.append('descricaoGrupo', descricaoGrupo)
        if (imageFile) form.append('imgGrupo', imageFile)

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

  return { groupData, updateGroupData }
}

export default useGroupData
