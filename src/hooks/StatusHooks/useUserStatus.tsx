import { useState, useEffect, useCallback } from 'react';
import useUserId from '../useUserId';
import { API_URL } from '../../config';

export interface CoverStatus {
  imageUrl: string;
}

export interface UserStatus {
  id: number;
  imgStatus?: string;
  legenda?: string;
  [key: string]: any;
}

interface UseUserStatusResult {
  coverStatus: CoverStatus | null;
  statuses: UserStatus[];
  isViewerOpen: boolean;
  loading: boolean;
  error: string | null;
  fetchUserStatuses: () => Promise<void>;
  closeViewer: () => void;
}

const useUserStatus = (): UseUserStatusResult => {
  const idUser = useUserId();
  const [coverStatus, setCoverStatus] = useState<CoverStatus | null>(null);
  const [statuses, setStatuses] = useState<UserStatus[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca a imagem de capa
  const fetchCoverStatus = useCallback(async () => {
    if (!idUser) return;
    try {
      const res = await fetch(`${API_URL}/api/status/statusUsuarioCapa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      
      if (data.statusImage) {
        setCoverStatus({ imageUrl: data.statusImage });
      }
    } catch (err) {
      console.error('useUserStatus.fetchCoverStatus:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [idUser]);

  // Busca todos os statuses do usuário e abre o viewer
  const fetchUserStatuses = useCallback(async () => {
    if (!idUser) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/api/status/statusUsuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data.statuses)) {
        setStatuses(data.statuses);
        setIsViewerOpen(true);

      } else {
        throw new Error('Resposta inválida: statuses não é um array');
      }
    } catch (err) {
      console.error('useUserStatus.fetchUserStatuses:', err);
      setError(err instanceof Error ? err.message : String(err));

    } finally {
      setLoading(false);
    }
  }, [idUser]);

  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    setStatuses([]);
    setError(null);
  }, []);

  useEffect(() => {
    fetchCoverStatus();
  }, [fetchCoverStatus]);

  return {
    coverStatus,
    statuses,
    isViewerOpen,
    loading,
    error,
    fetchUserStatuses,
    closeViewer,
  };
};

export default useUserStatus;
