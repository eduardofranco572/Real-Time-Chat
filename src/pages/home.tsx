import '../assets/css/global.css';
import '../assets/css/home.css';
import '../assets/css/menu.css';
import '../assets/css/container.css';

import React, { useState, useCallback, useEffect} from 'react';

import { IoSearchOutline } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { BsPlusCircleDotted } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

// imgs
//@ts-expect-error ignorar img 
import iconeChat from '../assets/img/chat2.svg';
//@ts-expect-error ignorar img 
import iconePadrao from '../assets/img/iconePadrao.svg';

import ContactForm from '../components/ContactForm';
import ContactList from '../components/ContactList';
import UserInfo from '../components/UserInfo';
import Chat from '../components/Chat';
import StatusList from '../components/StatusList'

import useUserInfo from '../hooks/useUserInfo';
import useContacts from '../hooks/useContacts';
import StatusUploader from '../components/StatusUploader';


const Home: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idUser, setidUser] = useState<number | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [menuState, setMenuState] = useState<'principalMenu' | 'abaStatus' | 'dadosConta'>('principalMenu');
  const [isUploaderVisible, setUploaderVisible] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [statusImage, setStatusImage] = useState<string>('');

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

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
        setEmail('');
        setNome('');
        fetchContacts();
      } else {
        alert('Erro');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário: ', error);
    }
  }, [email, nome, idUser, fetchContacts]);

  // Pegar informações do chat atual
  const handleSelectContact = (id: number) => {
    setSelectedContactId(id);
    setShowContactDetails(false);
    setIsFormVisible(false);
  };

  //status
  const handleAddStatusClick = () => {
    const inputElement = document.getElementById('status-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    } else {
      console.error("Elemento de entrada de arquivo não encontrado!");
    }
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setUploaderVisible(true); 
  };

  const handleSaveStatus = async (file: File, caption: string) => {
    if (!idUser) {
      alert('Erro: Usuário não autenticado. Faça login para continuar.');
      return;
    }
  
    if (!file) {
      alert('Nenhuma imagem selecionada!');
      return;
    }

    const formData = new FormData();
    formData.append('imgStatus', file);
    formData.append('legenda', caption);
    formData.append('idAutor', idUser.toString());
  
    try {
      const response = await fetch('http://localhost:3000/salvarStatus', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      if (response.ok) {
        alert('Status salvo com sucesso!');
        setUploaderVisible(false);
      } else {
        alert('Erro ao salvar status: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao salvar status:', error);
    }
  };

  const fetchUserStatus = useCallback(async () => {
    if (!idUser) return;
  
    const dataJSON = JSON.stringify({ idUser });
  
    try {
      const response = await fetch('http://localhost:3000/statusUsuario', {
        method: 'POST',
        body: dataJSON,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
  
      if (result.message === 'ok') {
        console.log('aqui + ' + result.statusImage) 
        setStatusImage(result.statusImage || iconePadrao);
      }
    } catch (error) {
      console.error('Erro ao buscar status do usuário: ', error);
    }
  }, [idUser]);
  
  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);


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
      {isUploaderVisible && (
        <StatusUploader
          onSaveStatus={handleSaveStatus} 
          onClose={() => setUploaderVisible(false)}
          uploadedImage={uploadedImage}
        />
      )}

      <section className='conteinerHome'>
        <div className="menu">
          {menuState === 'abaStatus' && (
            <div className="abaStatus">
              <div className="cabecalhoStatus">
                <h1>Status</h1>
                <IoClose onClick={() => setMenuState('principalMenu')} />
              </div>
              <div className="seusStatus">
                <img id="iconeStatus" src={statusImage} alt="Ícone do Status" />
                <h1>Meu status</h1>
                <div className="btnADDStatus" onClick={handleAddStatusClick}>
                  <BsPlusCircleDotted />
                </div>
              </div>
              <div className='barraStatus'></div>
              <div className='contatoStatus'>
                <StatusList />
              </div>
              <input
                id="status-input"
                type="file"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]); 
                  }
                }}
              />
            </div>
          )}

          {menuState === 'dadosConta' && (
            <div className='dadosConta'>
              <div className='cabecalhoConta'>
                <h1>Dados da Conta</h1>
                <IoClose onClick={() => setMenuState('principalMenu')} />
              </div>
              {/* Conteúdo dos dados da conta */}
            </div>
          )}

          {menuState === 'principalMenu' && (
            <div className='principalMenu'>
              <div className='containerMenu'>
                <UserInfo 
                  userInfo={userInfo} 
                  onStatusClick={() => setMenuState('abaStatus')} 
                  onAccountClick={() => setMenuState('dadosConta')} 
                />
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
                <ContactList contacts={contacts} onSelectContact={handleSelectContact} />
              </div>
              <div className='footerMenu'>
                <span onClick={handleBtnOpen}><IoIosAddCircle /></span>
              </div>
            </div>
          )}
        </div>
        <div className='bodyContainer'>
          {selectedContactId ? (
            <Chat
              selectedContactId={selectedContactId}
              showContactDetails={showContactDetails}
              setShowContactDetails={setShowContactDetails}
              idUser={idUser} 
            />
          
          ) : (
            <div className='noContatos'>
              <img src={iconeChat} alt="" />
              <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
