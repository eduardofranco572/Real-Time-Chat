import React from 'react'
import { IoClose } from 'react-icons/io5'
import { Message } from '../../types'

interface ReplyBoxProps {
  message: Message
  currentUserId: number
  onClose: () => void
}

const ReplyBox: React.FC<ReplyBoxProps> = ({
  message,
  currentUserId,
  onClose
}) => {
  const sender =
    message.idUser === currentUserId ? 'Você' : message.nomeContato

  return (
    <div className="reply-box">
      <div className="mensagemReply">
        <strong>{sender}</strong>
        <span>{message.mensagem}</span>
      </div>
      <button className="btnCloseReply" onClick={onClose}>
        <IoClose />
      </button>
    </div>
  )
}

export default ReplyBox
