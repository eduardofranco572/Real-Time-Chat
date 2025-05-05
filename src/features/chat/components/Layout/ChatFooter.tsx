import React, { useState } from 'react'
import { IoMdPhotos, IoMdSend } from 'react-icons/io'
import { IoDocumentText } from 'react-icons/io5'
import { MdAdd } from 'react-icons/md'
import ChatMediaUploader from '../Media/ChatMediaUploader'
import ChatDocsUploader from '../Media/ChatDocsUploader'

interface ChatFooterProps {
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

  const handleSend = () => {
    if (!text.trim() || sending) return
    onSendText(text.trim())
    setText('')
  }

  return (
    <section className="footerChat">
      <div className="infoFC">
        <div className="topico2-container" style={{ position: 'relative' }}>
          {showAddOptions && (
            <div className="add-options-card">
              <div className="itensAddOptions">
                <button
                  onClick={() => {
                    onToggleDocs()
                    setShowAddOptions(false)
                  }}
                >
                  <IoDocumentText />
                  Documentos
                </button>
                <button
                  onClick={() => {
                    onToggleMedia()
                    setShowAddOptions(false)
                  }}
                >
                  <IoMdPhotos />
                  Fotos e Vídeos
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
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend()
          }}
        />

        <div className="topico2">
          <IoMdSend
            onClick={handleSend}
            style={{ opacity: sending ? 0.5 : 1, cursor: sending ? 'not-allowed' : 'pointer' }}
          />
        </div>
      </div>

      {showMediaUploader && (
        <ChatMediaUploader
          onSendMedia={(file, caption) => onSendMedia(file, caption)}
          onClose={onToggleMedia}
        />
      )}

      {showDocsUploader && (
        <ChatDocsUploader
          onSendMedia={(file, caption) => onSendDocs(file, caption)}
          onClose={onToggleDocs}
        />
      )}
    </section>
  )
}

export default ChatFooter
