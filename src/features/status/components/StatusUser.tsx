import React from 'react'
import useUserStatus from '../hooks/useUserStatus'
import useStatusViewer from '../hooks/useStatusViewer'
import StatusViewer from './StatusViewer'

import iconePadrao from '../../../assets/img/iconePadrao.svg'
import iconeNoStatus from '../../../assets/img/going-up.svg'

const StatusUser: React.FC = () => {
  const {
    coverStatus,
    statuses,
    setStatuses,
    isViewerOpen,
    loading,
    error,
    fetchUserStatuses,
    closeViewer,
  } = useUserStatus()

  const {
    activeIndex,
    goNext,
    goPrev,
    deleteCurrent,
    setActiveIndex,
  } = useStatusViewer({
    statuses,
    isOpen: isViewerOpen,
    onClose: closeViewer,
    onStatusesChange: setStatuses,
  })

  if (loading && !coverStatus) {
    return <p>Carregando informações do usuário...</p>
  }

  return (
    <div>
      {coverStatus ? (
        <img
          className="iconeStatusUser"
          src={coverStatus.imageUrl || iconePadrao}
          alt="Seu Status"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setActiveIndex(0)
            fetchUserStatuses()
          }}
        />
      ) : (
        <div className="noStatus">
          <img
            className="iconeNoStatusUser"
            src={iconeNoStatus}
            alt="Sem Status"
          />
          <p>Você ainda não postou nada hoje!</p>
        </div>
      )}

      {loading && coverStatus && <p>Carregando seus status...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {isViewerOpen && (
        <StatusViewer
          statuses={statuses}
          activeIndex={activeIndex}
          onClose={closeViewer}
          onDeleteStatus={deleteCurrent}
          onNext={goNext}
          onPrev={goPrev}
          canDelete
          selectedContactName="Seus Status"
        />
      )}
    </div>
  )
}

export default StatusUser
