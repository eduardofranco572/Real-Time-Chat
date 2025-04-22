import '../assets/css/global.css';
import '../assets/css/menu.css';
import '../assets/css/container.css';
import '../assets/css/status.css';

import React from 'react';
import Chat from '../components/chat/Chat';
import MenuContainer from '../components/menu/MenuContainer';
import useUserId from '../hooks/useUserId';

//@ts-expect-error ignorar img 
import iconeChat from '../assets/img/chat2.svg'; 

const Home: React.FC = () => {
  const idUser = useUserId();
  const [selectedChatId, setSelectedChatId] = React.useState<number | null>(null);
  const [selectedChatIsGroup, setSelectedChatIsGroup] = React.useState<boolean>(false);
  const [showContactDetails, setShowContactDetails] = React.useState(false);

  const handleSelectContact = (idChat: number, isGroup: boolean) => {
    setSelectedChatId(idChat);
    setSelectedChatIsGroup(isGroup);
    setShowContactDetails(false);
  };

  return (
    <section className='conteinerHome'> 
      <div className="menu">
        <MenuContainer onSelectContact={handleSelectContact} />
      </div>
      <div className='bodyContainer'>
        {selectedChatId ? (
          <Chat 
            selectedChatId={selectedChatId}
            selectedChatIsGroup={selectedChatIsGroup} 
            showContactDetails={showContactDetails}
            setShowContactDetails={setShowContactDetails}
            idUser={idUser}
          />
        ) : (
          <div className='noContatos'>
            <img src={iconeChat} alt="Ícone de chat" />
            <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;
