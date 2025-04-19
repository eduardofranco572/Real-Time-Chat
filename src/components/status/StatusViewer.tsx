import React from 'react';
import OptionMenuStatus from './OptionMenuStatus';
import useStatusViewer from '../../hooks/StatusHooks/useStatusViewer';

//@ts-expect-error ignorar img 
import iconePadrao from '../../assets/img/iconePadrao.svg';


interface StatusViewerProps {
  statuses: any[];
  selectedContactName: string | null;
  onClose: () => void;
  canDelete?: boolean;
}

const StatusViewer: React.FC<StatusViewerProps> = ({
  statuses,
  selectedContactName,
  onClose,
  canDelete = false,
}) => {
  const {
    localStatuses,
    activeIndex,
    thumbProgress,
    muted,
    videoRef,
    toggleMute,
    handleNext,
    handlePrev,
    handleDelete,
  } = useStatusViewer({ statuses, onClose, canDelete });

  return (
    <div className="statusOverlay">
      <div className="paginaStatus">
        <div className="statusDetails">
          <div className="menuStatus">
            <div className="userAltor">
              <img
                src={localStatuses[0]?.imgContato || iconePadrao}
                alt="Imagem do Contato"
              />
              <h2>{selectedContactName}</h2>
            </div>
            <OptionMenuStatus
              canDelete={canDelete}
              handleDelete={handleDelete}
              onClose={onClose}
              toggleMute={toggleMute}
              isMuted={muted}
            />
          </div>
          <div className="statusCarousel">
            <div className="carouselContent">
              {localStatuses.map((status, index) => {
                const isVideo = status.imgStatus.match(/\.(mp4|webm|ogg)$/i);
                return (
                  <div
                    key={status.id}
                    className={`statusDetailItem ${
                      index === activeIndex ? 'active' : 'hidden'
                    }`}
                  >
                    {isVideo ? (
                      <video
                        ref={index === activeIndex ? videoRef : null}
                        playsInline
                        src={status.imgStatus}
                        muted={muted}
                      />
                    ) : (
                      <img src={status.imgStatus} alt="Status" />
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
                {thumbProgress.map((_, idx) => (
                  <span
                    key={idx}
                    className={`thumb-bar ${
                      activeIndex === idx ? 'active' : ''
                    }`}
                  >
                    <div
                      className="progress"
                      style={{
                        width: `${thumbProgress[idx]}%`,
                        background: activeIndex === idx ? '#fff' : 'transparent',
                      }}
                    />
                  </span>
                ))}
              </div>
              <div className="botoes-story">
                <button
                  className={`carouselNav prev ${
                    activeIndex === 0 ? 'hidden' : ''
                  }`}
                  onClick={handlePrev}
                >
                  Anterior
                </button>
                <button
                  className={`carouselNav next ${
                    activeIndex === localStatuses.length - 1 ? 'hidden' : ''
                  }`}
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