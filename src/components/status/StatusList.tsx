import React, { useState, useCallback } from 'react';
import useStatus from '../../hooks/useStatus';
import StatusViewer from './StatusViewer';
//@ts-expect-error ignorar img 
import iconePadrao from '../../assets/img/iconePadrao.svg';

const StatusList: React.FC = () => {
  const { statuses } = useStatus();
  const [selectedContactStatuses, setSelectedContactStatuses] = useState<any[]>([]);
  const [selectedContactName, setSelectedContactName] = useState<string | null>(null);

  const handleStatusClick = useCallback(async (idContato: number, nomeContato: string) => {
    try {
      const response = await fetch(`http://localhost:3000/getUserStatuses/${idContato}`);
      const result = await response.json();

      if (response.ok) {
        setSelectedContactStatuses(result.statuses);
        setSelectedContactName(nomeContato);
      } else {
        console.error('Erro ao carregar os status do contato:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar os status do contato:', error);
    }
  }, []);

  const handleCloseDetails = () => {
    setSelectedContactStatuses([]);
    setSelectedContactName(null);
  };

  return (
    <div className="statusList">
      {selectedContactStatuses.length > 0 && (
        <StatusViewer
          statuses={selectedContactStatuses}
          selectedContactName={selectedContactName}
          onClose={handleCloseDetails}
        />
      )}

      {statuses.map((status) => (
        <div
          className="statusItem"
          key={status.id}
          onClick={() => handleStatusClick(status.idContato, status.nomeContato)}
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
