import React, { FormEvent, useState, useCallback } from 'react';
import { IoMdClose } from "react-icons/io";
import { IoMdPersonAdd } from "react-icons/io";
import { FaUserGroup, FaArrowLeftLong } from "react-icons/fa6";
import Select from 'react-select';

//@ts-expect-error ignorar img
import IconeAddcontact from '../assets/img/addcontact.svg';
//@ts-expect-error ignorar img
import iconePadrao from '../assets/img/iconePadrao.svg';

import GroupImageEditor from './ProfileImageEditor';
import useUserId from '../hooks/useUserId';
import useContacts from '../hooks/useContacts';
import { ChatItem } from '../components/ContactList';

interface ContactOption {
  value: number;
  label: string;
  avatar: string;
}

interface ContactFormProps {
  onClose: () => void;
  onSubmitContact: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitGroup: (
    e: FormEvent<HTMLFormElement>,
    imageFile?: File,
    participantIds?: number[]
  ) => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  nome: string;
  setNome: (nome: string) => void;
  groupName: string;
  setGroupName: (nome: string) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  onClose,
  onSubmitContact,
  onSubmitGroup,
  email,
  setEmail,
  nome,
  setNome,
  groupName,
  setGroupName
}) => {
  const idUser = useUserId();
  const { items: contacts } = useContacts(idUser);

  const [isContactVisible, setIsContactVisible] = useState(false);
  const [isGroupVisible, setIsGroupVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(true);

  const [groupSelectedImage, setGroupSelectedImage] = useState<string>('');
  const [isEditingGroupImage, setIsEditingGroupImage] = useState(false);
  const [croppedGroupImageFile, setCroppedGroupImageFile] = useState<File>();

  const [selectValue, setSelectValue] = useState<ContactOption[]>([]);

  const handleBtnContactOpen = useCallback(() => {
    setIsContactVisible(true);
    setIsOptionsVisible(false);
  }, []);

  const handleBtnGroupOpen = useCallback(() => {
    setIsGroupVisible(true);
    setIsOptionsVisible(false);
  }, []);

  const handleOptions = useCallback(() => {
    setIsContactVisible(false);
    setIsGroupVisible(false);
    setIsOptionsVisible(true);
  }, []);

  const handleGroupPhotoClick = useCallback(() => {
    document.getElementById('group-img-input')?.click();
  }, []);

  const handleGroupImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setGroupSelectedImage(ev.target?.result as string);
      setIsEditingGroupImage(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSaveGroupImage = useCallback((file: File) => {
    setCroppedGroupImageFile(file);
    setIsEditingGroupImage(false);
  }, []);

  const handleCancelGroupImageEdit = useCallback(() => {
    setIsEditingGroupImage(false);
  }, []);

  // Mapeia contatos para opções do select
  const options: ContactOption[] = contacts
  .filter((c: ChatItem) => !c.isGroup)
  .map((c: ChatItem) => ({
    value: c.id,
    label: c.nome,
    avatar: c.imageUrl || iconePadrao
  }));

  return (
    <>
      {isEditingGroupImage && groupSelectedImage && (
        <GroupImageEditor
          image={groupSelectedImage}
          onSave={handleSaveGroupImage}
          onCancel={handleCancelGroupImageEdit}
        />
      )}

      <section className='popUpCadastrar'>
        <div className='itensPopUpC'>
          <div className='btnCloseAdd'>
            <button onClick={handleOptions}><FaArrowLeftLong /></button>
            <button onClick={onClose}><IoMdClose /></button>
          </div>

          {isOptionsVisible && (
            <>
              <div className='headerPUCad'>
                <img src={IconeAddcontact} alt="" />
                <div className='infosHPUCad'>
                  <h1>Adicione um novo contato!</h1>
                  <p>Preencha os dados abaixo para adicionar um novo contato à sua lista.</p>
                </div>
              </div>
              <div className='barraPp'><span /></div>
              <div className='optionsAdd'>
                <div className='alinhaOptionsAdd'>
                  <button onClick={handleBtnContactOpen}>
                    <IoMdPersonAdd /> Novo Contato
                  </button>
                  <button onClick={handleBtnGroupOpen}>
                    <FaUserGroup /> Novo Grupo
                  </button>
                </div>
              </div>
            </>
          )}

          {isContactVisible && (
            <div className='containerAdd'>
              <div className='headerPUCad'>
                <div className='infosHPUCad'>
                  <h1>Adicione um novo contato!</h1>
                  <p>Preencha os dados abaixo para adicionar um novo contato à sua lista.</p>
                </div>
              </div>
              <form className='formPp' onSubmit={onSubmitContact}>
                <div className='elementosFormPp'>
                  <p className='titlesInput'>Email</p>
                  <input
                    className="inputFP"
                    type="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Digite o email do contato"
                    required
                  />
                </div>
                <div className='elementosFormPp'>
                  <p className='titlesInput'>Nome</p>
                  <input
                    className="inputFP"
                    type="text"
                    name="nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Digite o nome do contato"
                    required
                  />
                </div>
                <div className="btnAddContato">
                  <input type="submit" value="Adicionar contato" />
                </div>
              </form>
            </div>
          )}

          {isGroupVisible && (
            <div className='containerAdd'>
              <form
                className='formPp'
                onSubmit={e => onSubmitGroup(
                  e,
                  croppedGroupImageFile,
                  selectValue.map(v => v.value)
                )}
              >
                <div className='headerPUCad'>
                  <div className='infosHPUCad'>
                    <h1>Crie um novo Grupo!</h1>
                    <p>Preencha os dados abaixo para criar um novo grupo.</p>
                  </div>
                </div>

                <div className="fotoPerfil" onClick={handleGroupPhotoClick} style={{ cursor: 'pointer' }}>
                  {croppedGroupImageFile ? (
                    <img src={URL.createObjectURL(croppedGroupImageFile)} alt="Foto do grupo" />
                  ) : (
                    <div className="contenerimg">
                      <img className="imgPadraoGroup" src={iconePadrao} alt="Ícone Padrão" />
                    </div>
                  )}
                  <input
                    id="group-img-input"
                    type="file"
                    accept="image/*"
                    onChange={handleGroupImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className='elementosFormPp'>
                  <p className='titlesInput'>Nome do Grupo</p>
                  <input
                    className="inputFP"
                    type="text"
                    name="groupName"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="Digite o nome do grupo"
                    required
                  />
                </div>

                <div className='elementosFormPp'>
                  <p className='titlesInput'>Selecione participantes</p>
                  <Select
                    className="my-select"
                    classNamePrefix="my-select"
                    maxMenuHeight={400} 
                    options={options}
                    isMulti
                    placeholder="Filtre e selecione..."
                    onChange={items =>
                      setSelectValue(Array.isArray(items) ? items : [items])
                    }
                    formatOptionLabel={({ label, avatar }) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={avatar}
                          alt={label}
                          style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
                        />
                        <span>{label}</span>
                      </div>
                    )}
                    getOptionValue={opt => String(opt.value)}
                  />
                </div>

                <div className="btnAddContato">
                  <input type="submit" value="Adicionar Grupo" />
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ContactForm;