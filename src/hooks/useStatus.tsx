import { useState, useEffect, useCallback } from 'react';
import useUserId from './useUserId';
import { API_URL } from '../config';

export interface Status {
  id: number;
  idContato: number;
  idAutor: number;
  nomeContato: string;
  imgStatus?: string;
  legenda?: string;
  [key: string]: any;
}

interface UseStatusResult {
  statuses: Status[];               
  refreshStatuses: () => Promise<void>;
  contactStatuses: Status[];        
  contactName: string | null;
  fetchContactStatuses: (idContato: number, nomeContato: string) => Promise<void>;
  clearContactStatuses: () => void;
  loading: boolean;
  error: string | null;
}

const useStatus = (): UseStatusResult => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [contactStatuses, setContactStatuses] = useState<Status[]>([]);
  const [contactName, setContactName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idUser = useUserId();

  // Carrega statuses do usuário
  const refreshStatuses = useCallback(async () => {
    if (!idUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/status/getStatus/${idUser}`);
      const data = await res.json();
      if (data.message === 'ok') {
        setStatuses(data.statuses || []);
      } else {
        throw new Error(data.error || `Status ${res.status}`);
      }
    } catch (err) {
      console.error('useStatus.refreshStatuses:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [idUser]);

  // Carrega statuses de um contato
  const fetchContactStatuses = useCallback(async (idContato: number, nomeContato: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/status/getUserStatuses/${idContato}`);
      const data = await res.json();
      if (res.ok && data.statuses) {
        setContactStatuses(data.statuses);
        setContactName(nomeContato);
      } else {
        throw new Error(data.error || `Status ${res.status}`);
      }
    } catch (err) {
      console.error('useStatus.fetchContactStatuses:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearContactStatuses = useCallback(() => {
    setContactStatuses([]);
    setContactName(null);
    setError(null);
  }, []);

  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  return {
    statuses,
    refreshStatuses,
    contactStatuses,
    contactName,
    fetchContactStatuses,
    clearContactStatuses,
    loading,
    error,
  };
};

export default useStatus;
