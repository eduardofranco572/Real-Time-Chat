import '../assets/css/global.css';
import '../assets/css/home.css';
import '../assets/css/menu.css';
import '../assets/css/container.css';

import React, { useState, useCallback, FormEvent, useEffect } from 'react';

// icons
import { IoSearchOutline } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";

// imgs
//@ts-expect-error ignorar img 
import iconeChat from '../assets/img/chat2.svg';

// Components
import ContactForm from '../components/ContactForm';
import ContactList from '../components/ContactList';
import UserInfo from '../components/UserInfo';

// Custom Hooks
import useUserInfo from '../hooks/useUserInfo';
import useContacts from '../hooks/useContacts';

const Home: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const [idUser, setidUser] = useState<number | null>(null);

  useEffect(() => {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const fetchUserId = async () => {
      try {
        const response = await fetch('http://localhost:3000/protected', requestOptions);
        if (response.ok) {
          const data = await response.json();
          setidUser(data.user);
        } else {
          console.log('Falha ao buscar o ID do usuário');
        }
      } catch (error) {
        console.log('Erro ao buscar o ID do usuário:', error);
      }
    };

    fetchUserId();
  }, []);

  const userInfo = useUserInfo(idUser);
  const { contacts, fetchContacts } = useContacts(idUser);

  const handleBtnClose = useCallback(() => {
    setIsFormVisible(false);
  }, []);

  const handleBtnOpen = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const dataJSON = JSON.stringify({
      email,
      nome,
      idUser
    });

    try {
      const response = await fetch('http://localhost:3000/addcontato', {
        method: 'POST',
        body: dataJSON,
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();

      if (result.message === 'ok') {
        alert('Adicionado com sucesso');
        fetchContacts();
      } else {
        alert('Erro');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário: ', error);
    }
  }, [email, nome, idUser, fetchContacts]);

  return (
    <>
      {isFormVisible && (
        <ContactForm 
          onClose={handleBtnClose}
          onSubmit={handleSubmit}
          email={email}
          setEmail={setEmail}
          nome={nome}
          setNome={setNome}
        />
      )}
      <section className='conteinerHome'>
        <div className="menu">
          <UserInfo userInfo={userInfo} />
          <div className='search'>
            <div className='filter'>
              <span>
                <IoSearchOutline />
              </span>
              <input
                className="inputSearch"
                type="text"
                name="filterContatos"
                placeholder="Pesquisar"
                required
              />
            </div>
          </div>
          <ContactList contacts={contacts} />
          <div className='footerMenu'>
            <span onClick={handleBtnOpen}><IoIosAddCircle /></span>
          </div>
        </div>
        <div className='bodyContainer'>
          <div className='noContatos'>
            <img src={iconeChat} alt="" />
            <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
