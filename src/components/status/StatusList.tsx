import React from 'react';
import useStatus from '../../hooks/useStatus';
import StatusViewer from './StatusViewer';
//@ts-expect-error ignorar img 
import iconePadrao from '../../assets/img/iconePadrao.svg';

const StatusList: React.FC = () => {
  const {
    statuses,            
    contactStatuses,     
    contactName,         
    fetchContactStatuses, 
    clearContactStatuses,
    loading,              
    error,               
  } = useStatus();

  return (
    <div className="statusList">
      {loading && <p>Carregando status...</p>}
      {error   && <p className="text-red-500">Erro: {error}</p>}

      {contactStatuses.length > 0 && (
        <StatusViewer
          statuses={contactStatuses}
          selectedContactName={contactName}
          onClose={clearContactStatuses}
        />
      )}

      {statuses.map((status) => (
        <div
          key={status.id}
          className="statusItem"
          onClick={() => fetchContactStatuses(status.idContato, status.nomeContato)}
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
  );
};

export default StatusList;
