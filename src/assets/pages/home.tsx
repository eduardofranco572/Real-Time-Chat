import '../css/global.css';
import '../css/home.css';
import '../css/menu.css';
import '../css/container.css';

import React, { useState, useCallback, FormEvent } from 'react';

// icons
import { IoSearchOutline } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";

// imgs
//@ts-expect-error ignorar img 
import iconePadrao from '../img/iconePadrao.svg';
//@ts-expect-error ignorar img 
import iconeAdd_files from '../img/add_files.svg';

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

  const idUser = localStorage.getItem('USU_ID');
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
        fetchContacts(); // Refresh contacts list
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
            <img src={iconeAdd_files} alt="" />
            <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
