import { useState, useCallback, useEffect } from 'react'
import { deleteStatusService, Status } from '../services/statusService'

export interface UseStatusViewerProps {
  statuses: Status[]
  isOpen: boolean
  onClose: () => void
  onStatusesChange: (newStatuses: Status[]) => void
}

export interface UseStatusViewerResult {
  activeIndex: number
  isFirst: boolean
  isLast: boolean
  goNext: () => void
  goPrev: () => void
  deleteCurrent: () => Promise<void>
  setActiveIndex: (i: number) => void
}

export default function useStatusViewer({
  statuses,
  isOpen,
  onClose,
  onStatusesChange,
}: UseStatusViewerProps): UseStatusViewerResult {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    if (statuses.length === 0) {
      onClose()
    } else if (activeIndex >= statuses.length) {
      setActiveIndex(statuses.length - 1)
    }
  }, [isOpen, statuses, activeIndex, onClose])

  const goNext = useCallback(() => {
    setActiveIndex(i => Math.min(i + 1, statuses.length - 1))
  }, [statuses.length])

  const goPrev = useCallback(() => {
    setActiveIndex(i => Math.max(i - 1, 0))
  }, [])

  const deleteCurrent = useCallback(async () => {
    const s = statuses[activeIndex]
    if (!s) return

    await deleteStatusService(s.id)
    const updated = statuses.filter((_, i) => i !== activeIndex)
    onStatusesChange(updated)
  }, [statuses, activeIndex, onStatusesChange])

  return {
    activeIndex,
    isFirst: activeIndex === 0,
    isLast: activeIndex === statuses.length - 1,
    goNext,
    goPrev,
    deleteCurrent,
    setActiveIndex,
  }
}
