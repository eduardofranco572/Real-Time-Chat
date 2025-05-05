import React, { useState, useEffect, useCallback } from 'react';
import { MdEdit } from "react-icons/md";
import useUserId from '../hooks/useUserId';
import useUserData from '../hooks/useUserData';
import ProfileImageEditor from './ProfileImageEditor';
import Swal from 'sweetalert2';

const DadosConta: React.FC = () => {
  const idUser = useUserId();
  const { userData, updateUserData } = useUserData(idUser ? idUser.toString() : '');

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isEditingNome, setIsEditingNome] = useState(false);
  const [isEditingDescricao, setIsEditingDescricao] = useState(false);

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [croppedImageFile, setCroppedImageFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    setNome(userData.nome);
    setDescricao(userData.descricao);
  }, [userData]);

  const handlePhotoClick = useCallback(() => {
    const input = document.getElementById('img-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const target = e.target;
    if (target.files && target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
        setIsEditingImage(true);
      };
      reader.readAsDataURL(target.files[0]);
    }
  }, []);

  const handleSaveImage = useCallback((file: File) => {
    setCroppedImageFile(file);
    setIsEditingImage(false);
  }, []);

  const handleCancelImageEdit = useCallback(() => {
    setIsEditingImage(false);
  }, []);

  const handleSave = useCallback(async () => {
    await updateUserData(nome, descricao, croppedImageFile);
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "success",
      title: "Dados atualizados com sucesso!"
    });

    setCroppedImageFile(undefined);
  }, [nome, descricao, croppedImageFile, updateUserData]);

  return (
    <>
      {isEditingImage && selectedImage && (
        <ProfileImageEditor
          image={selectedImage}
          onSave={handleSaveImage}
          onCancel={handleCancelImageEdit}
        />
      )}
      <div className="InformacoesUsuario">
        <div className="fotoPerfil" onClick={handlePhotoClick} style={{ cursor: 'pointer' }}>
          <img 
            src={croppedImageFile ? URL.createObjectURL(croppedImageFile) : userData.imageUrl} 
            alt="Foto do usuário" 
          />
          <input
            id="img-input"
            type="file"
            name="img"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="infoPessoal">
          <div className="dadosInfor1">
            <p>Seu nome</p>
            <div className="input">
              <input
                type="text"
                name="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                readOnly={!isEditingNome}
                onBlur={() => setIsEditingNome(false)}
                className={isEditingNome ? 'editing' : ''}
              />
              <MdEdit onClick={() => setIsEditingNome(true)} />
            </div>
          </div>

          <div className="dadosInfor1">
            <p>Descrição</p>
            <div className="input">
              <input
                type="text"
                name="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                readOnly={!isEditingDescricao}
                onBlur={() => setIsEditingDescricao(false)}
                className={isEditingDescricao ? 'editing' : ''}
              />
              <MdEdit onClick={() => setIsEditingDescricao(true)} />
            </div>
          </div>

          <div className="btnSalvarAlteracoes">
            <button onClick={handleSave}>Salvar dados</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DadosConta;
