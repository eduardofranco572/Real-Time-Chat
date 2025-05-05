import React, { FormEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoMdClose } from 'react-icons/io';
import Select from 'react-select';

import iconePadrao from '../assets/img/iconePadrao.svg';

import GroupImageEditor from './ProfileImageEditor';
import useUserId from '../hooks/useUserId';
import useContacts from '../hooks/useContacts';
import { ChatItem } from './ContactList';

interface ContactOption {
  value: number;
  label: string;
  avatar: string;
}

interface ContactFormProps {
  mode: 'contact' | 'group';
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
  mode,
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

  const [rawImageData, setRawImageData] = useState<string>('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [croppedImageFile, setCroppedImageFile] = useState<File>();
  const [selectedParticipants, setSelectedParticipants] = useState<ContactOption[]>([]);
  const [groupStep, setGroupStep] = useState<number>(1);

  const options: ContactOption[] = contacts
    .filter((c: ChatItem) => !c.isGroup)
    .map((c: ChatItem) => ({ value: c.id, label: c.nome, avatar: c.imageUrl || iconePadrao }));

  const handleImageClick = () => {
    document.getElementById('group-img-input')?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setRawImageData(ev.target?.result as string);
      setIsEditingImage(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = (file: File) => {
    setCroppedImageFile(file);
    setIsEditingImage(false);
  };

  const handleCancelImage = () => {
    setIsEditingImage(false);
  };

  const handleNext = () => {
    setGroupStep(2);
  };

  const modalContent = (
    <section className='popUpCadastrar'>
      <div className='itensPopUpC'>
        <div className='btnCloseAdd'>
          <button onClick={onClose}><IoMdClose /></button>
        </div>

        {mode === 'contact' && (
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

        {mode === 'group' && (
          <div className='containerAdd'>
            <div className='headerPUCad'>
              <div className='infosHPUCad'>
                <h1>Crie um novo Grupo!</h1>
                <p>Preencha os dados abaixo para criar um novo grupo.</p>
              </div>
            </div>

            {groupStep === 1 && (
              <form className='formPp'>
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
                      setSelectedParticipants(Array.isArray(items) ? items : [items])
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
                  <button type="button" onClick={handleNext}>Próximo</button>
                </div>
              </form>
            )}

            {groupStep === 2 && (
              <form
                className='formPp'
                onSubmit={e => onSubmitGroup(
                  e,
                  croppedImageFile,
                  selectedParticipants.map(v => v.value)
                )}
              >
                <div className="fotoGrupo" onClick={handleImageClick} style={{ cursor: 'pointer' }}>
                  {croppedImageFile ? (
                    <img src={URL.createObjectURL(croppedImageFile)} alt="Foto do grupo" />
                  ) : (
                    <div className="contenerimg">
                      <img className="imgPadraoGroup" src={iconePadrao} alt="Ícone Padrão" />
                    </div>
                  )}
                  <input
                    id="group-img-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className='elementosFormPp'>
                  <p className='titlesInput'>Nome do Grupo</p>
                  <input
                    className="inputFP"
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="Digite o nome do grupo"
                    required
                  />
                </div>
                <div className="btnAddContato">
                  <input type="submit" value="Adicionar Grupo" />
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <>
      {isEditingImage && rawImageData && (
        <GroupImageEditor
          image={rawImageData}
          onSave={handleSaveImage}
          onCancel={handleCancelImage}
        />
      )}
      {createPortal(modalContent, document.body)}
    </>
  );
};

export default ContactForm;
