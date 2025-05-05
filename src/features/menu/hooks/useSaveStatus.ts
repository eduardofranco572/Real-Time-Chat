import { useState, useCallback } from 'react'
import { saveStatusService } from '../services/statusService'

export default function useSaveStatus(idUser: number | null) {
  const [loading, setLoading] = useState(false)

  const saveStatus = useCallback(
    async (file: File, caption: string) => {
      if (!idUser) {
        alert('Usuário não autenticado')
        return
      }
      try {
        setLoading(true)
        await saveStatusService(idUser, file, caption)
      } catch (err: any) {
        alert('Erro: ' + (err.message || 'desconhecido'))
      } finally {
        setLoading(false)
      }
    },
    [idUser]
  )

  return { saveStatus, loading }
}
