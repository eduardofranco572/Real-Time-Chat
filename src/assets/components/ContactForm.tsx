import React, { FormEvent } from 'react';
import { IoMdClose } from "react-icons/io";

//@ts-expect-error ignorar img 
import iconeAdd_files from '../img/add_files.svg';

interface ContactFormProps {
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  nome: string;
  setNome: (nome: string) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onClose, onSubmit, email, setEmail, nome, setNome }) => {
  return (
    <section className='popUpCadastrar'>
      <div className='btnClose'>
        <button onClick={onClose}><IoMdClose /></button>
      </div>
      <div className='headerPUCad'>
        <img src={iconeAdd_files} alt="" />
        <div className='infosHPUCad'>
          <h1>Adicione um novo contato!</h1>
          <p>Preencha os dados abaixo para adicionar um novo contato à sua lista.</p>
        </div>
      </div>
      <div className='barraPp'>
        <span></span>
      </div>
      <form className='formPp' onSubmit={onSubmit}>
        <div className='elementosFormPp'>
          <p className='titlesInput'>Email</p>
          <input
            className="inputFP"
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o email do contato"
          />
        </div>
        <div className='elementosFormPp'>
          <p className='titlesInput'>Nome</p>
          <input
            className="inputFP"
            type="text"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome do contato"
          />
        </div>
        <div className="btnAddContato">
          <input type="submit" value="Adicionar contato" />
        </div>
      </form>
    </section>
  );
}

export default ContactForm;
