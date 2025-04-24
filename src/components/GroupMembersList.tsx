import React from 'react';
import { IoMdPersonAdd } from "react-icons/io";

interface Member {
  id: number;
  nome: string;
  imageUrl: string;
}

interface Props {
  members: Member[];
}

const GroupMembersList: React.FC<Props> = ({ members }) => (
  <div className="group-members">
    <p>{members.length} membros</p>
    <div className='bntAddNewMember'>
      <button><IoMdPersonAdd /> <span>Adicionar Membro</span> </button>   
    </div>
    <ul>
      {members.map(m => (
        <li key={m.id} className="member-item"> 
          <img
            src={m.imageUrl || '/path/to/iconePadrao.svg'}
            alt={m.nome}
            className="member-avatar"
          />
          <span>{m.nome}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default GroupMembersList;
