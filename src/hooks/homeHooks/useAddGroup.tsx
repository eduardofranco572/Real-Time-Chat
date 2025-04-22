import { useCallback } from 'react';
import { API_URL } from '../../config';

interface UseAddGroupReturn {
  addGroup: (
    groupName: string,
    imageFile: File | undefined,
    participantIds: number[]
  ) => Promise<void>;
}

const useAddGroup = (idUser: number | null): UseAddGroupReturn => {
  const addGroup = useCallback(
    async (groupName: string, imageFile?: File, participantIds: number[] = []) => {
      if (!idUser) {
        alert('Usuário não autenticado');
        return;
      }

      const formData = new FormData();
      formData.append('nomeGrupo', groupName);
      formData.append('idUser', String(idUser));
      formData.append('participantIds', JSON.stringify(participantIds));

      if (imageFile) formData.append('imgGrupo', imageFile);

      try {
        const res = await fetch(`${API_URL}/api/group/addGroup`, {
            method: 'POST',
            body: formData
        });

        const json = await res.json();
        if (res.ok) {
            console.log('Grupo criado:', json);
        } else {
            alert('Erro: ' + (json.error || 'desconhecido'));
        }
      } catch (err) {
            console.error(err);
            alert('Falha ao criar grupo');
        } 
    },
    [idUser]
  );

  return { addGroup };
};

export default useAddGroup;
