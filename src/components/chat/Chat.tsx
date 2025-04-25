import React, { useState, useEffect } from 'react';
import { IoMdMore, IoMdSend, IoMdPhotos } from 'react-icons/io';
import { MdAdd } from 'react-icons/md';
import { AiFillAudio } from 'react-icons/ai';
import { IoDocumentText, IoClose } from 'react-icons/io5';
import MessageList from './MessageList';
import ChatMediaUploader from './ChatMediaUploader';
import ChatDocsUploader from './ChatDocsUploader';
import useChatInfo from '../../hooks/chatHooks/useChatInfo';
import useMessages from '../../hooks/chatHooks/useMessages';
import { useChatHandlers } from '../../hooks/chatHooks/useChatHandlers';
import useGroupData from '../../hooks/useGroupData';
import ChatDetails from './ChatDetails'

interface ChatProps {
  selectedChatId: number;
  showContactDetails: boolean;
  setShowContactDetails: React.Dispatch<React.SetStateAction<boolean>>;
  idUser: number | null;
  selectedChatIsGroup: boolean;
}

const Chat: React.FC<ChatProps> = ({
  selectedChatId,
  showContactDetails,
  setShowContactDetails,
  idUser,
  selectedChatIsGroup,
}) => {

  const [message, setMessage] = useState('');
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showDocsUploader, setShowDocsUploader] = useState(false);
  const { groupData, updateGroupData } = useGroupData(selectedChatId);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue]   = useState('');
  const chatInfo = useChatInfo(selectedChatId, idUser, selectedChatIsGroup);
  const { messages, setMessages } = useMessages(selectedChatId);
  const { handleSendMessage, handleSendMedia, handleSendDocs } = useChatHandlers();

  useEffect(() => {
    if (selectedChatIsGroup && groupData) {
      setNameValue(groupData.nome);
    }
  }, [selectedChatIsGroup, groupData]);

  if (idUser == null) return <div>Carregando usuário…</div>;
  if (selectedChatId == null) return <div>Selecione um chat para começar.</div>;
  if (!chatInfo) return <div>Loading chat info...</div>;

  const handleHideDetails = () => setShowContactDetails(false);
  const handleReplyMessage = (msg: any) => setReplyingMessage(msg);

  const onSendMessage = async () => {
    await handleSendMessage({
      idUser,
      idChat: selectedChatId,
      message,
      replyingMessage,
      setMessage,
      setReplyingMessage,
    });
  };

  const onSendMedia = async (file: File, caption: string) => {
    await handleSendMedia({ idUser, idChat: selectedChatId, file, caption });
  };
  const onSendDocs = async (file: File, caption: string) => {
    await handleSendDocs({ idUser, idChat: selectedChatId, file, caption });
  };

  const handleToggleEdit = async () => {
    if (isEditingDesc) {
      if (descValue.trim() === '') {
        setIsEditingDesc(false)
        return
      }
      await updateGroupData({ descricaoGrupo: descValue })
    }
    setIsEditingDesc((v) => !v)
  }

  const handleToggleEditName = async () => {
    if (isEditingName) {
      if (nameValue.trim() === '') {
        setIsEditingName(false);
        return;
      }
      await updateGroupData({ nomeGrupo: nameValue });
    }
    setIsEditingName(v => !v);
  };
  
  return (
    <section className='chat-container'>
      <div className='alinhaCO'>
        <section className='headerChat'>
          <div className='infosChat'>
            <div
              className='IconeContatoChat'
              onClick={() => setShowContactDetails(!showContactDetails)}
            >
              <img
                src={selectedChatIsGroup ? groupData.imgUrl : chatInfo.imageUrl}
                alt={chatInfo.nome}
              />
            </div>
            <div className='infosContatoChat'>
              {selectedChatIsGroup ? (
                <>
                  <h1>{groupData.nome}</h1>
                  <p>{groupData.descricaoGrupo}</p>
                </>
              ) : (
                <>
                  <h1>{chatInfo!.nome}</h1>
                  <p>{chatInfo!.descricao}</p>
                </>
              )}
            </div>
          </div>
          <div className='opcoesChat'>
            <IoMdMore />
          </div>
        </section>

        <section className={`Chat${selectedChatIsGroup ? ' chat--group' : ''}`}>
          <MessageList
            isGroup={selectedChatIsGroup}
            currentUserId={idUser}
            messages={messages}
            setMessages={setMessages}
            onReplyMessage={handleReplyMessage}
          />
        </section>

        {replyingMessage && (
          <div className='reply-box'>
            <div className='mensagemReply'>
              <strong>
                {replyingMessage.idUser === idUser
                  ? 'Você'
                  : replyingMessage.nomeContato}
              </strong>
              <span>{replyingMessage.mensagem}</span>
            </div>
            <button
              className='btnCloseReply'
              onClick={() => setReplyingMessage(null)}
            >
              <IoClose />
            </button>
          </div>
        )}

        {showMediaUploader && (
          <ChatMediaUploader
            onSendMedia={onSendMedia}
            onClose={() => setShowMediaUploader(false)}
          />
        )}
        {showDocsUploader && (
          <ChatDocsUploader
            onSendMedia={onSendDocs}
            onClose={() => setShowDocsUploader(false)}
          />
        )}

        <section className='footerChat'>
          <div className='infoFC'>
            <div className='topico2-container' style={{ position: 'relative' }}>
              {showAddCard && (
                <div className='add-options-card'>
                  <div className='itensAddOptions'>
                    <button
                      onClick={() => {
                        setShowDocsUploader(true);
                        setShowAddCard(false);
                      }}
                    >
                      <IoDocumentText />
                      Documentos
                    </button>
                    <button
                      onClick={() => {
                        setShowMediaUploader(true);
                        setShowAddCard(false);
                      }}
                    >
                      <IoMdPhotos />
                      Fotos e Vídeos
                    </button>
                  </div>
                </div>
              )}
              <div className='topico2' onClick={() => setShowAddCard(prev => !prev)}>
                <MdAdd />
              </div>
            </div>
            <input
              className='inputinfosFC'
              type='text'
              name='mensagem'
              placeholder='Digite uma mensagem'
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSendMessage();
              }}
            />
            <div className='topico2'>
              <AiFillAudio />
              <IoMdSend onClick={onSendMessage} />
            </div>
          </div>
        </section>
      </div>

      {showContactDetails && (
        <ChatDetails
          chatInfo={chatInfo!}
          groupData={groupData}
          updateGroupData={updateGroupData} 
          selectedChatIsGroup={selectedChatIsGroup}
          isEditingName={isEditingName}
          nameValue={nameValue}
          onNameChange={setNameValue}
          onToggleEditName={handleToggleEditName}
          isEditingDesc={isEditingDesc}
          descValue={descValue}
          onDescChange={setDescValue}
          onToggleEditDesc={handleToggleEdit}
          onHideDetails={handleHideDetails}
        />
      )}

    </section>
  );
};

export default Chat;