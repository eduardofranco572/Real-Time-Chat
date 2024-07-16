import { useState, useEffect } from 'react';

const useUserInfo = (idUser: string | null) => {
  const [userInfo, setUserInfo] = useState({ nome: '', descricao: '' });

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
