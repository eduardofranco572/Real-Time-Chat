import { useState, useEffect, useCallback } from 'react';
import useUserId from './useUserId'; 

interface Status {
  id: number;
  idContato: number;
  idAltor: number;
  nomeContato: string;
  imgStatus: string;
  legenda: string;
}

const useStatus = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const idUser = useUserId();
  
  const fetchStatuses = useCallback(async () => {
    if (!idUser) return;

    try {
      const response = await fetch(`http://localhost:3000/getStatus/${idUser}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.message === 'ok') {
        setStatuses(result.statuses || []);
        console.log('Resposta do servidor:', result.statuses);
      } else {
        console.error('Erro ao buscar status:', result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  }, [idUser]);

  useEffect(() => {
    if (idUser) {
      fetchStatuses();
    }
  }, [idUser, fetchStatuses]);

  return { statuses, fetchStatuses };
};

export default useStatus;
