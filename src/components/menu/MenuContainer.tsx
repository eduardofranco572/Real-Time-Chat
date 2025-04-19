import React, { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { BsPlusCircleDotted } from "react-icons/bs";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import UserInfo from '../../components/UserInfo';
import ContactList from '../../components/ContactList';
import ContactForm from '../../components/ContactForm';

import useUserInfo from '../../hooks/useUserInfo';
import useContacts from '../../hooks/useContacts';
import useUserId from '../../hooks/useUserId';
import useUserStatus from '../../hooks/homeHooks/useUserStatus';
import useSaveStatus from '../../hooks/homeHooks/useSaveStatus';
import useAddContact from '../../hooks/homeHooks/useAddContact';
import useSelectContact from '../../hooks/homeHooks/useSelectContact';

import io from 'socket.io-client';
import { API_URL } from '../../config';
const socket = io(`${API_URL}`);

const DadosConta = lazy(() => import('../../components/DadosConta'));
const StatusList = lazy(() => import('../../components/status/StatusList'));
const StatusUser = lazy(() => import('../../components/status/StatusUser'));
const StatusUploader = lazy(() => import('../status/StatusUploader'));

interface MenuContainerProps {
  onSelectContact: (chatId: number) => void;
}

interface Contact {
  id: number;
  nomeContato: string;
  imageUrl: string;
}

const MenuContainer: React.FC<MenuContainerProps> = ({ onSelectContact }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [menuState, setMenuState] = useState<'principalMenu' | 'abaStatus' | 'dadosConta'>('principalMenu');
  const [isUploaderVisible, setUploaderVisible] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const idUser = useUserId();
  const userInfo = useUserInfo(idUser);
  const { contacts, fetchContacts } = useContacts(idUser);
  const statusImage = useUserStatus(idUser, menuState === 'abaStatus');
  const { saveStatus } = useSaveStatus(idUser);
  const addContact = useAddContact(idUser, fetchContacts);
  const selectContact = useSelectContact({ idUser, onSelectContact });

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

  const filteredContacts = contacts.filter((c: Contact) =>
    c.nomeContato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleNewMsg = (newMsg: any) => {
      fetchContacts();
    };

    socket.on('newMessage', handleNewMsg);
    return () => { socket.off('newMessage', handleNewMsg); };
  }, [fetchContacts]);

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
        <Suspense fallback={<Skeleton height={200} />}>
          <StatusUploader
            onSaveStatus={handleSaveStatus}
            onClose={() => setUploaderVisible(false)}
            uploadedMedia={uploadedImage}
          />
        </Suspense>
      )}

      {menuState === 'abaStatus' && (
        <Suspense fallback={<Skeleton height={200} />}>
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
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const maxSize = 10 * 1024 * 1024;
                  if (file.size > maxSize) {
                    alert('O arquivo excede o limite de 10MB. Por favor, selecione outro arquivo.');
                    return;
                  }
                  handleImageUpload(file);
                }
              }}
            />
          </div>
        </Suspense>
      )}

      {menuState === 'dadosConta' && (
        <Suspense fallback={<Skeleton height={200} />}>
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
                <span><IoSearchOutline /></span>
                <input
                  className="inputSearch"
                  type="text"
                  name="filterContatos"
                  placeholder="Pesquisar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  required
                />
              </div>
            </div>

            <ContactList 
              contacts={filteredContacts as Contact[]}
              onSelectContact={selectContact}
            />
          </div>

          <div className="footerMenu">
            <span onClick={handleBtnOpen}><IoIosAddCircle /></span>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuContainer;
