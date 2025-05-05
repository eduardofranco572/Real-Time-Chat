import React from 'react'
import useStatus from '../../../hooks/useStatus'
import useStatusViewer from '../hooks/useStatusViewer'
import StatusViewer from './StatusViewer'

import iconePadrao from '../../../assets/img/iconePadrao.svg'

const StatusList: React.FC = () => {
  const {
    statuses,
    contactStatuses,
    setContactStatuses,
    contactName,
    fetchContactStatuses,
    clearContactStatuses,
    loading,
    error,
  } = useStatus()

  const {
    activeIndex,
    goNext,
    goPrev,
    deleteCurrent,
    setActiveIndex,
  } = useStatusViewer({
    statuses: contactStatuses,
    isOpen: contactStatuses.length > 0,
    onClose: clearContactStatuses,
    onStatusesChange: setContactStatuses,
  })

  return (
    <div className="statusList">
      {loading && <p>Carregando status...</p>}
      {error   && <p className="text-red-500">Erro: {error}</p>}

      {contactStatuses.length > 0 && (
        <StatusViewer
          statuses={contactStatuses}
          activeIndex={activeIndex}
          onClose={clearContactStatuses}
          onDeleteStatus={deleteCurrent}
          onNext={goNext}
          onPrev={goPrev}
          canDelete={false}
          selectedContactName={contactName}
        />
      )}

      {statuses.map((status) => (
        <div
          key={status.id}
          className="statusItem"
          onClick={() => {
            setActiveIndex(0)
            fetchContactStatuses(status.idContato, status.nomeContato)
          }}
        >
          <img
            src={status.imgStatus || iconePadrao}
            alt={`Status de ${status.nomeContato}`}
            className="statusImage"
          />
          <div className="statusInfo">
            <h2>{status.nomeContato}</h2>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatusList
