import { useState, useEffect, useCallback } from 'react';

interface Status {
  id: number;
  idAltor: number;
  nomeAltor: string;
  imgStatus: string;
}

const useStatus = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);

  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/getStatus', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.message === 'ok') {
        setStatuses(result.statuses || []);
      }
    } catch (error) {
      console.error('Erro ao buscar status: ', error);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return { statuses, fetchStatuses };
};

export default useStatus;
