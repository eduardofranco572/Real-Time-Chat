import React, { useState, useCallback, lazy, Suspense } from 'react';
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { BsPlusCircleDotted } from "react-icons/bs";

import UserInfo from '../../components/UserInfo';
import ContactList from '../../components/ContactList';
import ContactForm from '../../components/ContactForm';

import useUserInfo from '../../hooks/useUserInfo';
import useContacts from '../../hooks/useContacts';
import useUserId from '../../hooks/useUserId';
import useUserStatus from '../../hooks/homeHooks/useUserStatus';
import useSaveStatus from '../../hooks/homeHooks/useSaveStatus';
import useAddContact from '../../hooks/homeHooks/useAddContact';

const DadosConta = lazy(() => import('../../components/DadosConta'));
const StatusList = lazy(() => import('../../components/status/StatusList'));
const StatusUser = lazy(() => import('../../components/status/StatusUser'));
const StatusUploader = lazy(() => import('../status/StatusUploader'));

interface MenuContainerProps {
  onSelectContact: (id: number) => void;
}

const MenuContainer: React.FC<MenuContainerProps> = ({ onSelectContact }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [menuState, setMenuState] = useState<'principalMenu' | 'abaStatus' | 'dadosConta'>('principalMenu');
  const [isUploaderVisible, setUploaderVisible] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const idUser = useUserId();
  const userInfo = useUserInfo(idUser);
  const { contacts, fetchContacts } = useContacts(idUser);
  const statusImage = useUserStatus(idUser, menuState === 'abaStatus');
  const { saveStatus } = useSaveStatus(idUser);
  const addContact = useAddContact(idUser, fetchContacts);

  const handleBtnClose = useCallback(() => {
    setIsFormVisible(false);
  }, []);

  const handleBtnOpen = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await addContact(email, nome);
    setEmail('');
    setNome('');
  }, [email, nome, addContact]);

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
    await saveStatus(file, caption);
    setUploaderVisible(false);
  };

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
        <Suspense fallback={<div>Carregando uploader...</div>}>
          <StatusUploader
            onSaveStatus={handleSaveStatus} 
            onClose={() => setUploaderVisible(false)}
            uploadedImage={uploadedImage}
          />
        </Suspense>
      )}
      {menuState === 'abaStatus' && (
        <Suspense fallback={<div>Carregando status...</div>}>
          <div className="abaStatus">
            <div className="cabecalhoStatus">
              <h1>Status</h1>
              <IoClose onClick={() => setMenuState('principalMenu')} />
            </div>
            <div className="seusStatus">
              <StatusUser />
              <h1>Meu status</h1>
              <div className="btnADDStatus" onClick={handleAddStatusClick}>
                <BsPlusCircleDotted />
              </div>
            </div>
            <div className="barraStatus"></div>
            <div className="contatoStatus">
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
        </Suspense>
      )}
      {menuState === 'dadosConta' && (
        <Suspense fallback={<div>Carregando dados da conta...</div>}>
          <div className="dadosConta">
            <div className="cabecalhoConta">
              <h1>Dados da Conta</h1>
              <IoClose onClick={() => setMenuState('principalMenu')} />
            </div>
            <DadosConta />
          </div>
        </Suspense>
      )}
      {menuState === 'principalMenu' && (
        <div className="principalMenu">
          <div className="containerMenu">
            <UserInfo 
              userInfo={userInfo} 
              onStatusClick={() => setMenuState('abaStatus')} 
              onAccountClick={() => setMenuState('dadosConta')} 
            />
            <div className="search">
              <div className="filter">
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
            <ContactList 
              contacts={contacts} 
              onSelectContact={onSelectContact} 
            />
          </div>
          <div className="footerMenu">
            <span onClick={handleBtnOpen}>
              <IoIosAddCircle />
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuContainer;
