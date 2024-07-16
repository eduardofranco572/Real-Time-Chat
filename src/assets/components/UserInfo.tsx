import React from 'react';
import iconePadrao from '../img/iconePadrao.svg';

interface UserInfoProps {
  userInfo: {
    nome: string;
    descricao: string;
  };
}

const UserInfo: React.FC<UserInfoProps> = ({ userInfo }) => {
  return (
    <div className='elementosMenu'>
      <div className='headerMenu'>
        <img id="icone" src={iconePadrao} alt="Ícone Padrão" />
        <div className='textHM'>
          <h1>{userInfo.nome}</h1>
          <p>{userInfo.descricao}</p>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
