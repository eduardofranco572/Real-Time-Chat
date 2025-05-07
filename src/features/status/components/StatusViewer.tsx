import React, { useState, useEffect, useRef } from 'react'
import OptionMenuStatus from './OptionMenuStatus'
import { Status } from '../services/statusService'

import iconePadrao from '../../../assets/img/iconePadrao.svg'

export interface StatusViewerProps {
  statuses: Status[]
  activeIndex: number
  onClose: () => void
  onDeleteStatus: () => Promise<void>
  onNext: () => void
  onPrev: () => void
  canDelete?: boolean
  selectedContactName: string | null
}

const StatusViewer: React.FC<StatusViewerProps> = ({
  statuses,
  activeIndex,
  onClose,
  onDeleteStatus,
  onNext,
  onPrev,
  canDelete = false,
  selectedContactName,
}) => {
  const [thumbProgress, setThumbProgress] = useState<number[]>([])
  const [muted, setMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // sempre que mudar o array, reinicia barras de progresso
  useEffect(() => {
    setThumbProgress(Array(statuses.length).fill(0))
  }, [statuses])

  // progresso automático de imagens
  useEffect(() => {
    const cur = statuses[activeIndex]
    if (!cur) return

    const isVideo = !!cur.imgStatus?.match(/\.(mp4|webm|ogg)$/i)
    if (isVideo) return

    const iv = setInterval(() => {
      setThumbProgress((prev) => {
        const next = [...prev]
        if (next[activeIndex] < 100) {
          next[activeIndex] += 2
        } else {
          clearInterval(iv)
          onNext()
        }
        return next
      })
    }, 100)

    return () => clearInterval(iv)
  }, [activeIndex, statuses, onNext])

  // progresso de vídeo
  useEffect(() => {
    const cur = statuses[activeIndex]
    if (!cur) return

    const isVideo = !!cur.imgStatus?.match(/\.(mp4|webm|ogg)$/i)
    const vid = videoRef.current
    if (isVideo && vid) {
      vid.currentTime = 0
      vid.play().catch(() => {})
      const handleTime = () => {
        if (!vid.duration) return
        const pct = (vid.currentTime / vid.duration) * 100
        setThumbProgress((prev) => {
          const next = [...prev]
          next[activeIndex] = pct
          return next
        })
      }
      const handleEnd = () => onNext()

      vid.addEventListener('timeupdate', handleTime)
      vid.addEventListener('ended', handleEnd)
      return () => {
        vid.pause()
        vid.removeEventListener('timeupdate', handleTime)
        vid.removeEventListener('ended', handleEnd)
      }
    }
  }, [activeIndex, statuses, onNext])

  const toggleMute = () => setMuted((m) => !m)

  const cur = statuses[activeIndex]
  if (!cur) return null

  const isFirst = activeIndex === 0
  const isLast = activeIndex === statuses.length - 1

  return (
    <div className="statusOverlay">
      <div className="paginaStatus">
        <div className="statusDetails">
          <div className="menuStatus">
            <div className="userAltor">
              <img src={cur.imgContato || iconePadrao} alt="Contato" />
              <h2>{selectedContactName}</h2>
            </div>
            <OptionMenuStatus
              canDelete={canDelete}
              handleDelete={onDeleteStatus}
              onClose={onClose}
              toggleMute={toggleMute}
              isMuted={muted}
            />
          </div>

          <div className="statusCarousel">
            <div className="carouselContent">
              {statuses.map((st, idx) => {
                const isVideo = !!st.imgStatus?.match(/\.(mp4|webm|ogg)$/i)
                const active = idx === activeIndex
                return (
                  <div
                    key={st.id}
                    className={`statusDetailItem ${active ? 'active' : 'hidden'}`}
                  >
                    {isVideo ? (
                      <video
                        ref={active ? videoRef : null}
                        src={st.imgStatus}
                        playsInline
                        muted={muted}
                      />
                    ) : (
                      <img src={st.imgStatus} alt="Status" />
                    )}
                    {st.legenda && (
                      <div className="statusLegenda">
                        <p>{st.legenda}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <nav className="slide-nav">
              <div className="slide-thumb">
                {thumbProgress.map((p, i) => (
                  <span
                    key={i}
                    className={`thumb-bar ${i === activeIndex ? 'active' : ''}`}
                  >
                    <div
                      className="progress"
                      style={{
                        width: `${p}%`,
                        background: i === activeIndex ? '#fff' : 'transparent',
                      }}
                    />
                  </span>
                ))}
              </div>
              <div className="botoes-story">
                {!isFirst && (
                  <button className="carouselNav prev" onClick={onPrev}>
                    Anterior
                  </button>
                )}
                {!isLast && (
                  <button className="carouselNav next" onClick={onNext}>
                    Próximo
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusViewer 
