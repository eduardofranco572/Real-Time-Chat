import { useState, useEffect, useCallback } from 'react'
import useUserId from '../../../hooks/useUserId'
import {
  Status,
  CoverStatus,
  fetchCoverStatusService,
  fetchUserStatusesService,
} from '../services/statusService'

export interface UseUserStatusResult {
  coverStatus: CoverStatus | null
  statuses: Status[]
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>
  isViewerOpen: boolean
  loading: boolean
  error: string | null
  fetchUserStatuses: () => Promise<void>
  closeViewer: () => void
}

export default function useUserStatus(): UseUserStatusResult {
  const idUser = useUserId()

  const [coverStatus, setCoverStatus] = useState<CoverStatus | null>(null)
  const [statuses, setStatuses] = useState<Status[]>([])
  const [isViewerOpen, setViewerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carrega a capa de status
  const loadCover = useCallback(async () => {
    if (!idUser) return
    try {
      const cover = await fetchCoverStatusService(idUser)
      setCoverStatus(cover)
    } catch (err: any) {
      setError(err.message)
    }
  }, [idUser])

  // Busca todos os statuses e abre o viewer
  const fetchUserStatuses = useCallback(async () => {
    if (!idUser) return
    setLoading(true)
    setError(null)
    try {
      const all = await fetchUserStatusesService(idUser)
      setStatuses(all)
      setViewerOpen(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [idUser])

  const closeViewer = useCallback(() => {
    setViewerOpen(false)
    setStatuses([])
    setError(null)
  }, [])

  useEffect(() => {
    loadCover()
  }, [loadCover])

  return {
    coverStatus,
    statuses,
    setStatuses,
    isViewerOpen,
    loading,
    error,
    fetchUserStatuses,
    closeViewer,
  }
}
