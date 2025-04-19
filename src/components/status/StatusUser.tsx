import React from 'react';
import useUserStatus from '../../hooks/StatusHooks/useUserStatus';
import StatusViewer from './StatusViewer';

//@ts-expect-error ignorar img 
import iconePadrao from '../../assets/img/iconePadrao.svg';

const StatusUser: React.FC = () => {
  const {
    coverStatus,
    statuses,
    isViewerOpen,
    loading,
    error,
    fetchUserStatuses,
    closeViewer,
  } = useUserStatus();

  if (loading && !coverStatus) {
    return <p>Carregando informações do usuário...</p>;
  }

  return (
    <div>
      {coverStatus ? (
        <div>
          <img
            className="iconeStatusUser"
            src={coverStatus.imageUrl || iconePadrao}
            alt="Seu Status"
            style={{ cursor: 'pointer' }}
            onClick={fetchUserStatuses}
          />
        </div>
      ) : (
        <p>Sem capa de status disponível.</p> //colocar o icone do usuario!
      )}

      {loading && coverStatus && <p>Carregando seus status...</p>}
      {error && <p className="text-red-500">Erro: {error}</p>}

      {isViewerOpen && (
        <StatusViewer
          statuses={statuses}
          selectedContactName="Seus Status"
          onClose={closeViewer}
          canDelete
        />
      )}
    </div>
  );
};

export default StatusUser;
