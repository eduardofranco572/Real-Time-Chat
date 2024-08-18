import React from 'react';
//@ts-expect-error ignorar img 
import iconePadrao from '../img/iconePadrao.svg';

interface UserInfoProps {
  userInfo: {
    nome: string;
    descricao: string;
    imageUrl: string;
  };
} 

const UserInfo: React.FC<UserInfoProps> = ({ userInfo }) => {
  return (
    <div className='elementosMenu'>
      <div className='headerMenu'>
      <img
          id="icone"
          src={userInfo.imageUrl || iconePadrao}
          alt="Ícone do Usuário"
        />
        <div className='textHM'>
          <h1>{userInfo.nome}</h1>
          <p>{userInfo.descricao}</p> 
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
