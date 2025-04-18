import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const useUserId = () => {
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
        const response = await fetch(`${API_URL}/api/auth/protected`, requestOptions);
        if (response.ok) {
          const data = await response.json();
          setIdUser(data.user);
        } else {
          console.log('Falha ao buscar o ID do usuário');
        }
      } catch (error) {
        console.log('Erro ao buscar o ID do usuário:', error);
      }
    };

    fetchUserId();
  }, []); 

  return idUser;
};

export default useUserId;
