import { useState, useEffect } from 'react';

interface UserInfo {
  nome: string;
  descricao: string;
  imageUrl: string;
}

const useUserInfo = (idUser: string | null) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nome: '',
    descricao: '',
    imageUrl: ''
  });

  useEffect(() => {
    async function fetchUserInfo() {
      if (!idUser) return;

      const dataJSON = JSON.stringify({ idUser });

      try {
        const response = await fetch('http://localhost:3000/InfoUser', {
          method: 'POST',
          body: dataJSON,
          headers: {
            'Content-Type': 'application/json'
          },
        });

        const result = await response.json();

        if (result.message === 'ok') {
          setUserInfo({
            nome: result.nome,
            descricao: result.descricao || 'Mensagem Padrão',
            imageUrl: result.imageUrl || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar informações do usuário: ', error);
      }
    }

    fetchUserInfo();
  }, [idUser]);

  return userInfo;
}

export default useUserInfo;
