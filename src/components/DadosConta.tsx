import React, { useState, useCallback } from 'react';
import { MdEdit } from "react-icons/md";
//@ts-expect-error ignorar img 
import iconePadrao from '../assets/img/iconePadrao.svg';

const DadosConta: React.FC = () => {
  
  return (
    <div className="InformacoesUsuario">
        <div className='fotoPerfil'>
            <img
                src={iconePadrao}
                alt="Status"
                style={{ cursor: 'pointer' }}
                // onClick={handleViewStatuses}
            />
        </div>
        <div className='infoPessoal'>
            <div className='dadosInfor1'>
                <h1>Seu nome</h1>
                <div className='edit'>
                    <p>Eduardo</p>
                    <MdEdit />
                </div>
            </div>
            <div className='dadosInfor1'>

            </div>
        </div>
    </div>
  );
};

export default DadosConta;
