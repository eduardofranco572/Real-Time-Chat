import { useState, useCallback, useEffect } from 'react';
import { getUserDataService, updateUserDataService, UserData } from '../services/userService';

const iconePadrao = '/assets/img/iconePadrao.svg';

const useUserData = (idUser: string) => {
  const [userData, setUserData] = useState<UserData>({
    nome: '',
    descricao: '',
    imageUrl: iconePadrao,
  });

  const fetchUserData = useCallback(async () => {
    try {
      const data = await getUserDataService(idUser);
      setUserData({
        nome: data.nome,
        descricao: data.descricao,
        imageUrl: data.imageUrl || iconePadrao,
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }, [idUser]);

  useEffect(() => {
    if (idUser) fetchUserData();
  }, [fetchUserData, idUser]);

  const updateUserData = useCallback(
    async (nome: string, descricao: string, imageFile?: File) => {
      try {
        await updateUserDataService({ idUser, nome, descricao, imageFile });
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