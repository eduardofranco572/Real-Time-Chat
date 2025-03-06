import React, { useState, useEffect } from 'react';
import useUserId from '../../hooks/useUserId';
import StatusViewer from './StatusViewer';

const StatusUser: React.FC = () => {
  const idUser = useUserId();
  const [coverStatus, setCoverStatus] = useState<{ imageUrl: string } | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (idUser !== null) {
      const fetchCoverStatus = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/status/statusUsuarioCapa', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idUser }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          if (data && data.statusImage) {
            setCoverStatus({ imageUrl: data.statusImage });
          }
        } catch (error) {
          console.error('Error fetching cover status:', error);
        }
      };

      fetchCoverStatus();
    }
  }, [idUser]);

  const handleViewStatuses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/status/statusUsuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idUser }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data.statuses)) {
        setStatuses(data.statuses);
        setIsViewerOpen(true); 
      } else {
        console.error('Invalid response: "statuses" is not an array.');
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setStatuses([]);
  };

  return (
    <div>
      {idUser ? (
        <div>
          {coverStatus ? (
            <div>
              <img
                className='iconeStatusUser'
                src={coverStatus.imageUrl}
                alt="Status"
                style={{ cursor: 'pointer' }}
                onClick={handleViewStatuses}
              />
            </div>
          ) : (
            <p>Sem capa de status disponível.</p> //muda aqui para icone do usuario
          )}

          {isViewerOpen && (
            <StatusViewer
              statuses={statuses}
              selectedContactName="Seus Status"
              onClose={closeViewer}
            />
          )}
        </div>
      ) : (
        <p>Carregando informações do usuário...</p>
      )}
    </div>
  );
};

export default StatusUser;