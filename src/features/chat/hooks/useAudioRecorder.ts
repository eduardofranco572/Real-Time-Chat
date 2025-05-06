import { useState, useRef } from 'react'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [timerLabel, setTimerLabel] = useState('00:00')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<number>()

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = e => chunksRef.current.push(e.data)
    recorder.start()

    setIsRecording(true)
    let seconds = 0
    intervalRef.current = window.setInterval(() => {
      seconds++
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      setTimerLabel(`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }, 1000)
  }

  const stopRecording = (): Promise<File> => {
    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current!
      recorder.onstop = () => {
        clearInterval(intervalRef.current)
        setIsRecording(false)
        setTimerLabel('00:00')
        streamRef.current?.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' })
        resolve(file)
      }
      recorder.stop()
    })
  }

  return { isRecording, timerLabel, startRecording, stopRecording }
}
