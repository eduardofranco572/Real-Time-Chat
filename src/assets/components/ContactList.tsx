import React from 'react';

//@ts-expect-error ignorar img 
import iconePadrao from '../img/iconePadrao.svg';

interface ContactListProps {
  contacts: { nomeContato: string; imageUrl: string }[];
}

const ContactList: React.FC<ContactListProps> = ({ contacts }) => {
  return (
    <div className='contatos'>
      <div className='cont1' id='cont1'>
        {contacts.map((contato, index) => (
          <div className='contato' key={index}>
            <div className='elementsCont1'>
              <img src={contato.imageUrl || iconePadrao} alt="" />
              <div className='textCont1'>
                <h1>{contato.nomeContato}</h1>
                <p>Test example user.</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactList;
