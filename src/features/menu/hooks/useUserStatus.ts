import { useState, useEffect, useCallback } from 'react'
import { fetchUserStatusService } from '../services/statusService'

import iconePadrao from '../../../assets/img/iconePadrao.svg'

export default function useUserStatus(
  idUser: number | null,
  active: boolean
): string {
  const [statusImage, setStatusImage] = useState<string>(iconePadrao)

  const load = useCallback(async () => {
    if (!idUser) return
    try {
      const url = await fetchUserStatusService(idUser)
      setStatusImage(url || iconePadrao)
    } catch {
      setStatusImage(iconePadrao)
    }
  }, [idUser])

  useEffect(() => {
    if (active) load()
  }, [active, load])

  return statusImage
}
