import { useState, useEffect } from 'react';
import { fetchUserIdService } from '../services/authService';

const useUserId = () => {
  const [idUser, setIdUser] = useState<number | null>(null);

  useEffect(() => {
    async function fetchId() {
      try {
        const userId = await fetchUserIdService();
        setIdUser(userId);
      } catch (error) {
        console.error('Erro ao buscar o ID do usuário:', error);
      }
    }
    fetchId();
  }, []);

  return idUser;
};

export default useUserId;
