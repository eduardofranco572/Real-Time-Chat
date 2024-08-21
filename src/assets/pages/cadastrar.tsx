import '../css/global.css'
import '../css/login.css'
import React, { FormEvent, useState, useRef } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';

import { IoCloseOutline } from "react-icons/io5";

//@ts-expect-error ignorar img 
import iconePadrao from '../img/iconePadrao.svg';

import LoginForm from './login';

function CadastroForm() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const validaEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const isValid = e.target.value.length >= 8 && regexEmail.test(e.target.value);
    
        if (!isValid) {
            e.target.style.borderColor = 'red';
        } else {
            e.target.style.borderColor = '#1CC88A';
        }
    }
    
    const validaSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSenha(e.target.value);
        const regexSenha = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W+)(?=^.{6,50}$).*/g;
        const isValid = e.target.value.length >= 8 && regexSenha.test(e.target.value);
    
        if (!isValid) {
            e.target.style.borderColor = 'red';
        } else {
            e.target.style.borderColor = '#1CC88A';
        }
    }

    // imagem
    const [image, setImage] = useState<string | null>(null);
    const [scale, setScale] = useState<number>(1);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const editorRef = useRef<AvatarEditor>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImage(result);
          setIsEditing(true);
        };
        reader.readAsDataURL(target.files[0]);
      }
    };

    const handleContainerClick = () => {
      const input = document.getElementById('img-input') as HTMLInputElement;
      if (input) {
        input.click();
      }
    };

    const handleSave = () => {
      if (editorRef.current) {
        const canvas = editorRef.current.getImageScaledToCanvas();
        const croppedImage = canvas.toDataURL();
        const previewImg = document.getElementById('preview') as HTMLImageElement;
        if (previewImg) {
          previewImg.src = croppedImage;
        }
        setIsEditing(false);
      }
    };

    const handleClosedEdit = () => {
      setIsEditing(false);
    };

    //

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('email', email);
      formData.append('senha', senha);
    
      const fileInput = document.getElementById('img-input') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('img', fileInput.files[0]); 
      }
    
      try {
        const response = await fetch('http://localhost:3000/cadastrar', {
            method: 'POST',
            body: formData,
        });
    
        const isOk = await response.json();
    
        if (isOk.message === 'ok') {
            alert('Cadastrado com sucesso');
        } else {
            alert('Erro ao cadastrar');
        }
    
      } catch (error) {
          console.error('Erro ao enviar formulário: ', error);
      }
    };
    
  
  return (
    <>
      {isEditing && (
        <section className="edtImage" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className='closed' onClick={handleClosedEdit}><IoCloseOutline /></div>
          <h1>Editar imagem</h1>
          <div className='imageforedit'>
            <AvatarEditor
              ref={editorRef}
              image={image!}
              width={300} 
              height={300}
              color={[28, 28, 28, 0.6]}
              scale={scale}
              borderRadius={150}
            />
          </div>
          <input
            type="range"
            min="1"
            max="2"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
          <button className='brtsaveedimg' onClick={handleSave}>Save Image</button>
        </section>
      )}   

      <section className='conteinerCadastrar'>
        <form encType="multipart/form-data" method="post" action="" onSubmit={handleSubmit}
        >
          <h1 className='titleForm'>Cadastrar</h1>
          <div className="img4-div">
            <div className="contenerimg" id="img-container4" onClick={handleContainerClick}>
              <img id="preview" src={iconePadrao} alt="Ícone Padrão" />
            </div>
            <input
              className="file"
              id="img-input"
              type="file"
              name="img"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              required
            />
          </div>
          <input
            className="inputinfos"
            type="text"
            name="nome"
            placeholder="Digite seu Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="inputinfos"
            type="text"
            name="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            onBlur={validaEmail}
          />
          <input
            className="inputinfos"
            type="password"
            name="senha"
            placeholder="Digite sua Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            onBlur={validaSenha}
          />

          <div className="cadastro">
            <p>Já possui uma conta?</p>
            <div className="buttoncadastro">
              <Link to={`/login`}><button>Entrar</button></Link>
            </div>
              <Routes>
                <Route path='/login' element={<LoginForm/>}/>
              </Routes>
          </div>
          <div className="button">
            <input type="submit" value="Cadastrar" />
          </div>
        </form>

      </section>
     
    </>
  )
}

export default CadastroForm
