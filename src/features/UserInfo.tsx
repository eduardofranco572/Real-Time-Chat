import React from 'react';
import iconePadrao from '../assets/img/iconePadrao.svg';
import { BsPlusCircleDotted } from "react-icons/bs";

interface UserInfoProps {
  userInfo: {
    nome: string;
    descricao: string;
    imageUrl: string;
  };
  onStatusClick: () => void;
  onAccountClick: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ userInfo, onStatusClick, onAccountClick }) => {
  return (
    <div className='elementosMenu'>
      <div className='headerMenu'>
        <img
          id="icone"
          src={userInfo.imageUrl || iconePadrao}
          alt="Ícone do Usuário"
          onClick={onAccountClick}
        />
        <div className='textHM'>
          <h1>{userInfo.nome}</h1>
          <p>{userInfo.descricao}</p> 
        </div>
      </div>
      <div className='btnStatus' onClick={onStatusClick}>
        <BsPlusCircleDotted />
      </div>
    </div>
  );
};

export default UserInfo;

