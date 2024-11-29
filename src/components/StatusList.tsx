import React from 'react';
import useStatus from '../hooks/useStatus';

//@ts-expect-error ignorar img
import iconePadrao from '../assets/img/iconePadrao.svg';

const StatusList: React.FC = () => {
  const { statuses } = useStatus();

  return (
    <div className="statusList">
      {statuses.map((status) => (
        <div className="statusItem" key={status.id}>
          <img
            src={status.imgStatus || iconePadrao}
            alt={`Status de ${status.nomeAltor}`}
            className="statusImage"
          />
          <div className="statusInfo">
            <h2>{status.nomeAltor}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusList;
