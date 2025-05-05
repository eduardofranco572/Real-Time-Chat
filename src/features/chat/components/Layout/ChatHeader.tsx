import React from 'react'
import { IoMdMore } from 'react-icons/io'
import { ChatInfo } from '../../types'

interface ChatHeaderProps {
  chatInfo: ChatInfo
  isGroup: boolean  
  onToggleDetails: () => void
  onToggleOptions: () => void
  onToggleWallpaperEditor: () => void
  onRemoveContact: () => void
  showOptions: boolean
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatInfo,
  isGroup, 
  onToggleDetails,
  onToggleOptions,
  onToggleWallpaperEditor,
  onRemoveContact,
  showOptions,
}) => (
  <section className="headerChat">
    <div className="infosChat">
      <div className="IconeContatoChat" onClick={onToggleDetails}>
        <img src={chatInfo.imageUrl} alt={chatInfo.nome} />
      </div>
      <div className="infosContatoChat">
        <h1>{chatInfo.nome}</h1>
        <p>{chatInfo.descricao}</p>
      </div>
    </div>

    <div className="opcoesChat" style={{ position: 'relative' }}>
      <IoMdMore onClick={onToggleOptions} />

      {showOptions && (
        <div className="header-options-card">
          <div className="itensHeaderOptions">
            <button
              onClick={e => {
                e.stopPropagation()
                onToggleWallpaperEditor()
              }}
            >
              Papel de parede
            </button>

            {!isGroup && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onRemoveContact()
                }}
              >
                Desfazer amizade
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  </section>
)

export default ChatHeader
