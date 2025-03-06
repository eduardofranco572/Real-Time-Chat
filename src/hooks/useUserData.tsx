import { useState, useCallback, useEffect } from 'react';

export interface UserData {
  nome: string;
  descricao: string;
  imageUrl: string;
}

const iconePadrao = '/assets/img/iconePadrao.svg';

const useUserData = (idUser: string) => {
  const [userData, setUserData] = useState<UserData>({
    nome: '',
    descricao: '',
    imageUrl: iconePadrao,
  });

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/contacts/InfoUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.message === 'ok') {
        setUserData({
          nome: data.nome,
          descricao: data.descricao,
          imageUrl: data.imageUrl || iconePadrao,
        });
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }, [idUser]);

  useEffect(() => {
    if (idUser) {
      fetchUserData();
    }

  }, [fetchUserData, idUser]);

  const updateUserData = useCallback(
    async (nome: string, descricao: string, imageFile?: File) => {
      try {
        const formData = new FormData();
        formData.append('idUser', idUser);
        formData.append('nome', nome);
        formData.append('descricao', descricao);

        if (imageFile) {
          formData.append('img', imageFile);
        }

        const response = await fetch('http://localhost:3000/api/contacts/UpdateUser', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao atualizar dados. Status: ${response.status}`);
        }

        await fetchUserData();
      } catch (error) {
        console.error('Erro ao atualizar dados:', error);
      }
    },
    [idUser, fetchUserData]
  );

  return { userData, updateUserData };
};

export default useUserData;
