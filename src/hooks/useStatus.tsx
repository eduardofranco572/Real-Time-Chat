import { useState, useEffect, useCallback } from 'react';
import useUserId from './useUserId';
import {
  fetchMyStatusesService,
  fetchContactStatusesService,
  Status
} from '../features/status/services/statusService';

interface UseStatusResult {
  statuses: Status[];
  refreshStatuses: () => Promise<void>;
  contactStatuses: Status[];
  setContactStatuses: (sts: Status[]) => void;
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

  const refreshStatuses = useCallback(async () => {
    if (!idUser) return;
    setLoading(true);
    setError(null) 
    try {
      const all = await fetchMyStatusesService(idUser);
      setStatuses(all);
    } catch (err: any) {
      console.error('useStatus.refreshStatuses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [idUser]);

  const fetchContactStatuses = useCallback(
    async (idContato: number, nomeContato: string) => {
      setLoading(true);
      setError(null);
      try {
        const all = await fetchContactStatusesService(idContato);
        setContactStatuses(all);
        setContactName(nomeContato);
      } catch (err: any) {
        console.error('useStatus.fetchContactStatuses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
    setContactStatuses,
    contactName,
    fetchContactStatuses,
    clearContactStatuses,
    loading,
    error,
  };
};

export default useStatus;