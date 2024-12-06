import { useState, useEffect, useCallback } from 'react';

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
  const [idUser, setIdUser] = useState<number | null>(null);

  useEffect(() => {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const fetchUserId = async () => {
      try {
        const response = await fetch('http://localhost:3000/protected', requestOptions);
        if (response.ok) {
          const data = await response.json();
          setIdUser(data.user);
        } else {
          console.error('Falha ao buscar o ID do usuário');
        }
      } catch (error) {
        console.error('Erro ao buscar o ID do usuário:', error);
      }
    };

    fetchUserId();
  }, []);

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
