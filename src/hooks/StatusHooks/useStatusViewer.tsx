import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../../config';

export interface Status {
  id: number;
  idContato?: number;
  imgStatus: string;
  legenda?: string;
  imgContato?: string;
  [key: string]: any;
}

interface UseStatusViewerProps {
  statuses: Status[];
  onClose: () => void;
  canDelete?: boolean;
}

interface UseStatusViewerResult {
  localStatuses: Status[];
  activeIndex: number;
  thumbProgress: number[];
  muted: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  toggleMute: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  handleDelete: () => Promise<void>;
}

const useStatusViewer = ({ statuses, onClose, canDelete = false }: UseStatusViewerProps): UseStatusViewerResult => {
  const [localStatuses, setLocalStatuses] = useState<Status[]>(statuses);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbProgress, setThumbProgress] = useState<number[]>([]);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setLocalStatuses(statuses);
  }, [statuses]);

  // Inicializa barras de progresso
  useEffect(() => {
    setThumbProgress(Array(localStatuses.length).fill(0));
  }, [localStatuses]);

  const handleNext = useCallback(() => {
    if (activeIndex < localStatuses.length - 1) {
      setThumbProgress(prev => {
        const next = [...prev];
        next[activeIndex] = 0;
        return next;
      });
      setActiveIndex(i => i + 1);
    }
  }, [activeIndex, localStatuses.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setThumbProgress(prev => {
        const next = [...prev];
        next[activeIndex] = 0;
        return next;
      });
      setActiveIndex(i => i - 1);
    }
  }, [activeIndex]);

  const handleDelete = useCallback(async () => {
    if (!canDelete) return;
    const statusToDelete = localStatuses[activeIndex];

    try {
      const res = await fetch(`${API_URL}/api/status/excluirStatus/${statusToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const updated = localStatuses.filter((_, idx) => idx !== activeIndex);
      setLocalStatuses(updated);

      if (updated.length === 0) {
        onClose();
      } else {
        setActiveIndex(prev => (prev >= updated.length ? updated.length - 1 : prev));
      }
    } catch (err) {
      console.error('useStatusViewer.handleDelete:', err);
    }
  }, [activeIndex, canDelete, localStatuses, onClose]);

  const toggleMute = useCallback(() => {
    setMuted(m => !m);
  }, []);

  // Para imagens
  useEffect(() => {
    const current = localStatuses[activeIndex];
    if (!current) return;
    const isVideo = current.imgStatus.match(/\.(mp4|webm|ogg)$/i);
    if (isVideo) return;

    const interval = setInterval(() => {
      setThumbProgress(prev => {
        const next = [...prev];
        if (next[activeIndex] < 100) {
          next[activeIndex] += 2;
        } else if (activeIndex < localStatuses.length - 1) {
          setActiveIndex(i => i + 1);
        } else {
          onClose();
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeIndex, localStatuses, onClose]);

  // Para vídeos
  useEffect(() => {
    const current = localStatuses[activeIndex];
    if (!current) return;
    const isVideo = current.imgStatus.match(/\.(mp4|webm|ogg)$/i);
    const video = videoRef.current;
    if (isVideo && video) {
      video.play().catch(e => console.error('Erro ao reproduzir vídeo:', e));
      const onTimeUpdate = () => {
        if (!video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        setThumbProgress(prev => {
          const next = [...prev];
          next[activeIndex] = pct;
          return next;
        });
      };
      const onEnded = () => {
        if (activeIndex < localStatuses.length - 1) {
          setActiveIndex(i => i + 1);
        } else {
          onClose();
        }
      };

      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('ended', onEnded);

      return () => {
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('ended', onEnded);
        video.pause();
      };
    } else if (video) {
      video.pause();
    }
  }, [activeIndex, localStatuses, onClose]);

  return {
    localStatuses,
    activeIndex,
    thumbProgress,
    muted,
    videoRef,
    toggleMute,
    handleNext,
    handlePrev,
    handleDelete,
  };
};

export default useStatusViewer;
