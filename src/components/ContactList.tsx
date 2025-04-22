import React from 'react';
// @ts-expect-error ignorar img
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
}

interface ContactListProps {
  items: ChatItem[];
  onOpenChat: (chatId: number, isGroup: boolean) => void;  
}

const ContactList: React.FC<ContactListProps> = ({ items, onOpenChat }) => (
  <div className="contatos">
    {items
      .sort((a, b) => {
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return tb - ta;
      })
      .map(item => (
        <div
          className="contato"
          key={`${item.isGroup ? 'group' : 'user'}-${item.id}`}
          onClick={() => onOpenChat(item.chatId, item.isGroup)}
        >
          <div className="elementsCont1">
            <img src={item.imageUrl || iconePadrao} alt={item.nome} />
            <div className="textCont1">
              <h1>{item.nome}</h1>
              <p>
                {item.mensagem
                  ? item.mensagem
                  : item.mediaUrl
                    ? 'mídia enviada'
                    : ''
                }
              </p>
            </div>
            {item.isGroup}
          </div>
        </div>
      ))}
  </div>
);

export default ContactList;