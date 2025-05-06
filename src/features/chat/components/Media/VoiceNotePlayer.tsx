import React, { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { MdPlayArrow, MdPause } from 'react-icons/md'

interface VoiceNotePlayerProps {
  url: string
}

const formatTime = (t: number) => {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ url }) => {
  const waveRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!waveRef.current) return

    const ws = WaveSurfer.create({
      container: waveRef.current,
      waveColor: '#888',
      progressColor: '#34B7F1',
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
      height: 40,
    })
    wavesurferRef.current = ws

    ws.load(url).catch(err => {
        if (err.name !== 'AbortError') {
            console.error('WaveSurfer load error:', err)
        }
    })

    ws.on('ready', () => {
      setDuration(ws.getDuration())
    })

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime())
    })

    ws.on('finish', () => {
      setPlaying(false)
      ws.seekTo(0)
    })

    ws.on('error', (err: Error) => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('WaveSurfer error:', err)
    })

    return () => {
      ws.destroy()
    }
  }, [url])

  const toggle = () => {
    const ws = wavesurferRef.current
    if (!ws) return
    ws.playPause()
    setPlaying(p => !p)
  }

  return (
    <div className="voice-note">
      <button className="vn-btn" onClick={toggle}>
        {playing ? <MdPause size={20}/> : <MdPlayArrow size={20}/>}
      </button>
      <div className="vn-waveform" ref={waveRef} />
      <span className="vn-time">{formatTime(currentTime)}</span>
      <span className="vn-time vn-time-total">{formatTime(duration)}</span>
    </div>
  )
}

export default VoiceNotePlayer