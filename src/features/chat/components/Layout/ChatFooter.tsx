import React, { useState } from 'react'
import { IoMdPhotos, IoMdSend } from 'react-icons/io'
import { IoDocumentText } from 'react-icons/io5'
import { MdAdd, MdFiberManualRecord } from 'react-icons/md'
import { AiFillAudio } from 'react-icons/ai'
import ChatMediaUploader from '../Media/ChatMediaUploader'
import ChatDocsUploader from '../Media/ChatDocsUploader'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'
import { uploadAudio } from '../../services/audioService'

interface ChatFooterProps {
  chatId: number
  userId: number
  onSendText: (text: string) => void
  onToggleMedia: () => void
  onToggleDocs: () => void
  showMediaUploader: boolean
  showDocsUploader: boolean
  onSendMedia: (file: File, caption: string) => void
  onSendDocs: (file: File, caption: string) => void
  sending?: boolean
}

const ChatFooter: React.FC<ChatFooterProps> = ({
  chatId,
  userId,
  onSendText,
  onToggleMedia,
  onToggleDocs,
  showMediaUploader,
  showDocsUploader,
  onSendMedia,
  onSendDocs,
  sending = false,
}) => {
  const [text, setText] = useState('')
  const [showAddOptions, setShowAddOptions] = useState(false)
  const { isRecording, timerLabel, startRecording, stopRecording } = useAudioRecorder()

  const handleSendText = () => {
    if (!text.trim() || sending) return
    onSendText(text.trim())
    setText('')
  }

  const handleAudioClick = async () => {
    if (!isRecording) {
      try {
        await startRecording()
      } catch (err) {
        console.error('Erro ao iniciar gravação:', err)
      }
    } else {
      try {
        const file = await stopRecording()
        await uploadAudio({ chatId, userId, file })
      } catch (err) {
        console.error('Erro ao parar/enviar gravação:', err)
      }
    }
  }

  return (
    <section className="footerChat">
      <div className="infoFC">
        <div className="topico2-container" style={{ position: 'relative' }}>
          {showAddOptions && (
            <div className="add-options-card">
              <div className="itensAddOptions">
                <button onClick={() => { onToggleDocs(); setShowAddOptions(false) }}>
                  <IoDocumentText /> Documentos
                </button>
                <button onClick={() => { onToggleMedia(); setShowAddOptions(false) }}>
                  <IoMdPhotos /> Fotos e Vídeos
                </button>
              </div>
            </div>
          )}
          <div className="topico2" onClick={() => setShowAddOptions(v => !v)}>
            <MdAdd />
          </div>
        </div>

        <input
          className="inputinfosFC"
          type="text"
          placeholder="Digite uma mensagem"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendText()}
        />

        <div className="topico2" onClick={handleAudioClick} style={{ position: 'relative' }}>
          {isRecording
            ? <MdFiberManualRecord size={24} className="recording-icon" />
            : <AiFillAudio size={24} />}
          {isRecording && (
            <span className="timer-label" style={{ marginLeft: 4 }}>
              {timerLabel}
            </span>
          )}
        </div>

        <div
          className="topico2"
          onClick={handleSendText}
          style={{
            opacity: sending ? 0.5 : 1,
            cursor: sending ? 'not-allowed' : 'pointer',
          }}
        >
          <IoMdSend />
        </div>
      </div>

      {showMediaUploader && (
        <ChatMediaUploader onSendMedia={onSendMedia} onClose={onToggleMedia} />
      )}
      {showDocsUploader && (
        <ChatDocsUploader onSendMedia={onSendDocs} onClose={onToggleDocs} />
      )}
    </section>
  )
}

export default ChatFooter
