import { Dispatch, SetStateAction } from 'react';
import { API_URL } from '../../config';

export interface Status {
  id: number;
  imgStatus: string;
  legenda?: string;
  [key: string]: any;
}

type SetStatuses = Dispatch<SetStateAction<Status[]>>;

type UseStatusViewerActions = {
  deleteStatus: () => Promise<void>;
};

const useStatusViewerActions = (
  localStatuses: Status[],
  setLocalStatuses: SetStatuses,
  activeIndex: number,
  onClose: () => void
): UseStatusViewerActions => {
  const deleteStatus = async () => {
    const statusToDelete = localStatuses[activeIndex];

    if (!statusToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/status/excluirStatus/${statusToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }

      const updatedStatuses = localStatuses.filter((_, idx) => idx !== activeIndex);
      setLocalStatuses(updatedStatuses);

      if (updatedStatuses.length === 0) {
        onClose();
      }
    
    } catch (error) {
      console.error('Erro ao excluir status:', error);
    }
  };

  return { deleteStatus };
};

export default useStatusViewerActions;
