import React, { useState, useCallback, useRef, useEffect } from 'react';
import useStatus from '../hooks/useStatus';

import { IoClose } from "react-icons/io5";
//@ts-expect-error ignorar img 
import iconePadrao from '../assets/img/iconePadrao.svg';

const StatusList: React.FC = () => {
  const { statuses } = useStatus();
  const [selectedContactStatuses, setSelectedContactStatuses] = useState<any[]>([]);
  const [selectedContactName, setSelectedContactName] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [thumbProgress, setThumbProgress] = useState<number[]>([]);

  const handleStatusClick = useCallback(async (idContato: number, nomeContato: string) => {
    try {
      const response = await fetch(`http://localhost:3000/getUserStatuses/${idContato}`);
      const result = await response.json();
  
      if (response.ok) {
        setSelectedContactStatuses(result.statuses);
        setSelectedContactName(nomeContato);
        setActiveIndex(0);
      } else {
        console.error('Erro ao carregar os status do contato:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar os status do contato:', error);
    }
  }, []);
  
  const handleCloseDetails = () => {
    setSelectedContactStatuses([]);
    setSelectedContactName(null);
  };

  const handleNext = () => {
    if (activeIndex < selectedContactStatuses.length - 1) {
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
        } else if (activeIndex < selectedContactStatuses.length - 1) {
          setActiveIndex((prevIndex) => prevIndex + 1); 
        } else {
          handleCloseDetails(); 
        }
        return updatedProgress;
      });
    }, 100);
  
    return () => clearInterval(interval);
  }, [activeIndex, selectedContactStatuses]);

  useEffect(() => {
    setThumbProgress(Array(selectedContactStatuses.length).fill(0));
  }, [selectedContactStatuses]);

  return (
    <div className="statusList">
      {selectedContactStatuses.length > 0 && (
        <div className="statusOverlay">
          <div className="statusDetails">
            <div className='menuStatus'>
              <div className='userAltor'>
                <img 
                  src={selectedContactStatuses[0]?.imgContato || iconePadrao} alt="Imagem do Contato"   
                />
                <h2>{selectedContactName}</h2>
              </div>
              <button onClick={handleCloseDetails}><IoClose/></button>
            </div>
            <div className="statusCarousel" ref={carouselRef}>
              <div className="carouselContent">
                {selectedContactStatuses.map((status, index) => ( 
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
                  {selectedContactStatuses.map((_, index) => (
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
                      activeIndex === selectedContactStatuses.length - 1 ? 'hidden' : ''
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
      )}

      {statuses.map((status) => (
        <div
          className="statusItem"
          key={status.id}
          onClick={() => handleStatusClick(status.idContato, status.nomeContato)}
        >
          <img
            src={status.imgStatus || iconePadrao}
            alt={`Status de ${status.nomeContato}`}
            className="statusImage"
          />
          <div className="statusInfo">
            <h2>{status.nomeContato}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusList;
