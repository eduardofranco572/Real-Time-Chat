import React from 'react';
// @ts-ignore
import iconePadrao from '../assets/img/iconePadrao.svg';

export interface ChatItem {
  id: number;
  nome: string;
  imageUrl: string;
  mensagem?: string;
  mediaUrl?: string;
  lastMessageAt?: string;
  chatId: number;
  isGroup: boolean;
  lastSenderName: string;
}

interface ContactListProps {
  items: ChatItem[];
  currentUserName: string;
  onOpenChat: (chatId: number, isGroup: boolean) => void;  
}

const ContactList: React.FC<ContactListProps> = ({ items, currentUserName, onOpenChat }) => (
  <div className="contatos">
    {items
      .sort((a, b) => {
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return tb - ta;
      })
      .map(item => {
        const sender = item.isGroup && item.lastSenderName === currentUserName
          ? 'Você'
          : item.lastSenderName;

        const preview = item.mensagem
          ? (item.isGroup
              ? `${sender}: ${item.mensagem}`
              : item.mensagem)
          : item.mediaUrl
            ? (item.isGroup
                ? `${sender}: mídia enviada`
                : 'mídia enviada')
            : '';

        return (
          <div
            className="contato"
            key={`${item.isGroup ? 'group' : 'user'}-${item.chatId}`}
            onClick={() => onOpenChat(item.chatId, item.isGroup)}
          >
            <div className="elementsCont1">
              <img src={item.imageUrl || iconePadrao} alt={item.nome} />
              <div className="textCont1">
                <h1>{item.nome}</h1>
                <p>{preview}</p>
              </div>
            </div>
          </div>
        );
      })}
  </div>
);

export default ContactList;
