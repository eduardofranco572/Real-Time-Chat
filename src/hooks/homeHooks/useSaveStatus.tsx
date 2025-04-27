import { useState } from 'react';
import { API_URL } from '../../config';

const useSaveStatus = (idUser: number | null) => {
  const [loading, setLoading] = useState(false);

  const saveStatus = async (file: File, caption: string) => {
    if (!idUser) {
      alert('Erro: Usuário não autenticado. Faça login para continuar.');
      return;
    }
    if (!file) {
      alert('Nenhuma imagem selecionada!');
      return;
    }

    const formData = new FormData();
    formData.append('idAutor', idUser.toString());
    formData.append('mediaStatus', file);
    formData.append('legenda', caption);
   
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/status/salvarStatus`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        alert('Erro ao salvar status: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao salvar status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { saveStatus, loading };
};

export default useSaveStatus;
