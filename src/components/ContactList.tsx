import React from 'react';
//@ts-expect-error ignorar img 
import iconePadrao from '../assets/img/iconePadrao.svg';

interface ContactListProps {
  contacts: {
    id: number;
    nomeContato: string;
    imageUrl: string;
    mensagem?: string;
    mediaUrl?: string;
    lastMessageAt?: string;
  }[];
  onSelectContact: (id: number) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onSelectContact }) => {
  return (
    <div className='contatos'>
      <div className='cont1'>
        {contacts.sort((a, b) => {
          const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return tb - ta;
        }).map((contato) => (
          <div className='contato' key={contato.id} onClick={() => onSelectContact(contato.id)}>
            <div className='elementsCont1'>
              <img src={contato.imageUrl || iconePadrao} alt={contato.nomeContato} />
              <div className='textCont1'>
                <h1>{contato.nomeContato}</h1>
                <p>
                  {contato.mensagem
                    ? contato.mensagem
                    : contato.mediaUrl
                      ? 'mídia enviada'
                      : ''
                  }
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
