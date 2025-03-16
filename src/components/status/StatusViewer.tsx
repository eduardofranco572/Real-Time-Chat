import React, { useState, useEffect, useRef } from 'react';
import OptionMenuStatus from './OptionMenuStatus';
//@ts-expect-error ignorar img 
import iconePadrao from '../../assets/img/iconePadrao.svg';

interface StatusViewerProps {
  statuses: any[];
  selectedContactName: string | null;
  onClose: () => void;
  canDelete?: boolean;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ statuses, selectedContactName, onClose, canDelete }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [thumbProgress, setThumbProgress] = useState<number[]>([]);
  const [localStatuses, setLocalStatuses] = useState(statuses);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setLocalStatuses(statuses);
  }, [statuses]);

  useEffect(() => {
    setThumbProgress(Array(localStatuses.length).fill(0));
  }, [localStatuses]);

  const handleNext = () => {
    if (activeIndex < localStatuses.length - 1) {
      setThumbProgress((prev) => {
        const updatedProgress = [...prev];
        updatedProgress[activeIndex] = 0;
        return updatedProgress;
      });
      setActiveIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setThumbProgress((prev) => {
        const updatedProgress = [...prev];
        updatedProgress[activeIndex] = 0;
        return updatedProgress;
      });
      setActiveIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleDelete = async () => {
    const statusToDelete = localStatuses[activeIndex];
    if (!statusToDelete) return;
    try {
      const response = await fetch(`http://localhost:3000/api/status/excluirStatus/${statusToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const updatedStatuses = localStatuses.filter((_, index) => index !== activeIndex);
      setLocalStatuses(updatedStatuses);
      if (updatedStatuses.length === 0) {
        onClose();
      } else {
        setActiveIndex((prevIndex) =>
          prevIndex >= updatedStatuses.length ? updatedStatuses.length - 1 : prevIndex
        );
      }
    } catch (error) {
      console.error('Erro ao excluir status:', error);
    }
  };

  // Para imagem
  useEffect(() => {
    const currentMediaPath = localStatuses[activeIndex]?.imgStatus;
    const isCurrentVideo = currentMediaPath && currentMediaPath.match(/\.(mp4|webm|ogg)$/i);
    if (isCurrentVideo) return;
    const interval = setInterval(() => {
      setThumbProgress((prev) => {
        const updatedProgress = [...prev];
        if (updatedProgress[activeIndex] < 100) {
          updatedProgress[activeIndex] += 2;
        } else if (activeIndex < localStatuses.length - 1) {
          setActiveIndex((prevIndex) => prevIndex + 1);
        } else {
          onClose();
        }
        return updatedProgress;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeIndex, localStatuses, onClose]);

  // Para vídeos
  useEffect(() => {
    const currentStatus = localStatuses[activeIndex];
    if (!currentStatus) return;
    const mediaPath = currentStatus.imgStatus;
    const isVideo = mediaPath && mediaPath.match(/\.(mp4|webm|ogg)$/i);

    if (isVideo) {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.play().catch(err => console.error('Erro ao reproduzir vídeo:', err));

        const onTimeUpdate = () => {
          if (!videoElement || !videoElement.duration) return;
          const progressPercent = (videoElement.currentTime / videoElement.duration) * 100;
          setThumbProgress(prev => {
            const updated = [...prev];
            updated[activeIndex] = progressPercent;
            return updated;
          });
        };

        const onEnded = () => {
          if (activeIndex < localStatuses.length - 1) {
            setActiveIndex(activeIndex + 1);
          } else {
            onClose();
          }
        };

        videoElement.addEventListener('timeupdate', onTimeUpdate);
        videoElement.addEventListener('ended', onEnded);

        return () => {
          videoElement.pause();
          videoElement.removeEventListener('timeupdate', onTimeUpdate);
          videoElement.removeEventListener('ended', onEnded);
        };
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [activeIndex, localStatuses, onClose]);

  return (
    <div className="statusOverlay">
      <div className="paginaStatus">
        <div className="statusDetails">
          <div className="menuStatus">
            <div className="userAltor">
              <img src={localStatuses[0]?.imgContato || iconePadrao} alt="Imagem do Contato" />
              <h2>{selectedContactName}</h2>
            </div>
            <OptionMenuStatus 
              canDelete={canDelete}
              handleDelete={handleDelete}
              onClose={onClose}
            />
          </div>
          <div className="statusCarousel">
            <div className="carouselContent">
              {localStatuses.map((status, index) => {
                const mediaPath = status.imgStatus;
                const isVideo = mediaPath.match(/\.(mp4|webm|ogg)$/i);
                return (
                  <div
                    key={status.id}
                    className={`statusDetailItem ${index === activeIndex ? 'active' : 'hidden'}`}
                  >
                    {isVideo ? (
                      <video
                        ref={index === activeIndex ? videoRef : null}
                        playsInline
                        src={mediaPath}
                        // Removemos autoPlay para controlar manualmente
                      />
                    ) : (
                      <img src={mediaPath} alt="Status" />
                    )}
                    <div className="statusLegenda">
                      <p>{status.legenda}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <nav className="slide-nav">
              <div className="slide-thumb">
                {localStatuses.map((_, index) => (
                  <span
                    key={index}
                    className={`thumb-bar ${activeIndex === index ? 'active' : ''}`}
                  >
                    <div
                      className="progress"
                      style={{
                        width: `${thumbProgress[index]}%`,
                        background: activeIndex === index ? '#fff' : 'transparent',
                      }}
                    />
                  </span>
                ))}
              </div>
              <div className="botoes-story">
                <button
                  className={`carouselNav prev ${activeIndex === 0 ? 'hidden' : ''}`}
                  onClick={handlePrev}
                >
                  Anterior
                </button>
                <button
                  className={`carouselNav next ${activeIndex === localStatuses.length - 1 ? 'hidden' : ''}`}
                  onClick={handleNext}
                >
                  Próximo
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusViewer;
