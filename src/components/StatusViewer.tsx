import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
//@ts-expect-error ignorar img 
import iconePadrao from '../assets/img/iconePadrao.svg';

interface StatusViewerProps {
  statuses: any[];
  selectedContactName: string | null;
  onClose: () => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ statuses, selectedContactName, onClose }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [thumbProgress, setThumbProgress] = useState<number[]>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const handleNext = () => {
    if (activeIndex < statuses.length - 1) {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setThumbProgress((prev) => {
        const updatedProgress = [...prev];
        if (updatedProgress[activeIndex] < 100) {
          updatedProgress[activeIndex] += 2;
        } else if (activeIndex < statuses.length - 1) {
          setActiveIndex((prevIndex) => prevIndex + 1);
        } else {
          onClose();
        }
        return updatedProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeIndex, statuses]);

  useEffect(() => {
    setThumbProgress(Array(statuses.length).fill(0));
  }, [statuses]);

  return (
    <div className="statusOverlay">
      <div className="statusDetails">
        <div className="menuStatus">
          <div className="userAltor">
            <img
              src={statuses[0]?.imgContato || iconePadrao}
              alt="Imagem do Contato"
            />
            <h2>{selectedContactName}</h2>
          </div>
          <button onClick={onClose}>
            <IoClose />
          </button>
        </div>
        <div className="statusCarousel" ref={carouselRef}>
          <div className="carouselContent">
            {statuses.map((status, index) => (
              <div
                key={status.id}
                className={`statusDetailItem ${index === activeIndex ? 'active' : 'hidden'}`}
              >
                <img src={status.imgStatus || iconePadrao} alt="Status" />
                <div className="statusLegenda">
                  <p>{status.legenda}</p>
                </div>
              </div>
            ))}
          </div>
          <nav className="slide-nav">
            <div className="slide-thumb">
              {statuses.map((_, index) => (
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
                className={`carouselNav next ${
                  activeIndex === statuses.length - 1 ? 'hidden' : ''
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
  );
};

export default StatusViewer;
