import React, { useRef, useEffect, useReducer } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../../../../config';

import {
  ChatHeader,
  MessageContainer,
  ChatFooter,
  ReplyBox,
  WallpaperEditor
} from '..';

import ChatDetails from './ChatDetails';

import {
  useChatInfo,
  useMessages,
  useMessageActions,
  useSendMessage,
  useRemoveContact
} from '../../hooks';
import { uiReducer, uiInitial } from '../uiReducer';

interface ChatContainerProps {
  chatId: number;
  userId: number | null;
  isGroup: boolean;
  showContactDetails: boolean;
  setShowContactDetails: React.Dispatch<React.SetStateAction<boolean>>;
  onBackMobile?: () => void;
}

const socket = io(API_URL);

const ChatContainer: React.FC<ChatContainerProps> = ({
  chatId,
  userId,
  isGroup,
  showContactDetails,
  setShowContactDetails,
  onBackMobile
}) => {
  const [ui, dispatch] = useReducer(
    uiReducer,
    uiInitial,
    () => {
      if (typeof window === 'undefined') return uiInitial;
      const saved = localStorage.getItem(`chat-ui-${chatId}`);
      return saved
        ? { ...uiInitial, ...JSON.parse(saved) }
        : uiInitial;
    }
  );

  useEffect(() => {
    if (ui.wallpaperUrl == null) return;
    localStorage.setItem(
      `chat-ui-${chatId}`,
      JSON.stringify({ wallpaperUrl: ui.wallpaperUrl })
    );
  }, [ui.wallpaperUrl, chatId]);

  const chatInfo = useChatInfo(chatId, userId, isGroup);
  const { messages, hasMore, loadMore, setMessages } = useMessages(chatId);
  const { deleteMessage, editMessage } = useMessageActions(setMessages);
  const { sendText, sendMedia, sendDocs, sending } = useSendMessage();
  const { removeContact, loading: removing } = useRemoveContact();

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const onScroll = () => {
      if (el.scrollTop < 100 && hasMore) {
        loadMore();
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => void el.removeEventListener('scroll', onScroll);
  }, [hasMore, loadMore]);

  if (userId == null) return <div className="headerChat">Carregando usuário…</div>;
  if (!chatInfo) return <div className="headerChat">Carregando chat…</div>;

  return (
    <section className="chat-container" 
      style={{ 
        backgroundImage: ui.wallpaperUrl
         ? `url(${ui.wallpaperUrl})` 
         : undefined, 
         backgroundSize: 'cover', 
         backgroundPosition: 'center' 
      }}
    >
      <div className={`alinhaCO ${showContactDetails ? 'hidden' : ''}`}>
        <section className="headerChat">
          <ChatHeader
            chatInfo={chatInfo}
            isGroup={isGroup}
            onToggleDetails={() => setShowContactDetails(prev => !prev)}
            onToggleOptions={() => dispatch({ type: 'TOGGLE_HEADER_OPTIONS' })}
            onToggleWallpaperEditor={() => dispatch({ type: 'TOGGLE_WALLPAPER_EDITOR' })}
            onRemoveContact={() => removeContact(userId!, chatInfo.id)}
            showOptions={ui.showHeaderOptions}
            onBackMobile={onBackMobile!}
          />
        </section>

        <section className={`Chat${isGroup ? ' chat--group' : ''}`} ref={containerRef}>
          <MessageContainer
            isGroup={isGroup}
            currentUserId={userId!}
            messages={messages}
            onDelete={deleteMessage}
            onEdit={editMessage}
            onReplyMessage={msg => dispatch({ type: 'SET_REPLY', payload: msg })}
          />
        </section>

        {ui.replyingMessage && (
          <ReplyBox
            message={ui.replyingMessage}
            currentUserId={userId!}
            onClose={() => dispatch({ type: 'SET_REPLY', payload: null })}
          />
        )}

        <section className="footerChat">
          <ChatFooter
            chatId={chatId}
            userId={userId!}
            onSendText={text => sendText(chatId, userId!, text, ui.replyingMessage?.id)}
            onToggleMedia={() => dispatch({ type: 'TOGGLE_MEDIA_UPLOADER' })}
            onToggleDocs={() => dispatch({ type: 'TOGGLE_DOCS_UPLOADER' })}
            showMediaUploader={ui.showMediaUploader}
            showDocsUploader={ui.showDocsUploader}
            onSendMedia={(file, caption) => sendMedia(chatId, userId!, file, caption)}
            onSendDocs={(file, caption) => sendDocs(chatId, userId!, file, caption)}
            sending={sending}
          />
        </section>

        {ui.showWallpaperEditor && (
          <WallpaperEditor
            defaultUrl={ui.wallpaperUrl!}
            onSave={url => dispatch({ type: 'SET_WALLPAPER', payload: url })}
            onCancel={() => dispatch({ type: 'TOGGLE_WALLPAPER_EDITOR' })}
          />
        )}
      </div>

      {showContactDetails && (
        <ChatDetails
          isOpen={showContactDetails}
          isGroup={isGroup}
          chatInfo={chatInfo}
          onClose={() => setShowContactDetails(false)}
        />
      )}

    </section>
  );
};

export default ChatContainer;
