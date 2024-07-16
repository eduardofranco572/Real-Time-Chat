import '../css/global.css'
import '../css/login.css'
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
//@ts-expect-error ignorar img 
import iconePadrao from '../img/iconePadrao.svg';

import LoginForm from './login';

function CadastroForm() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // const [user, setUser] = useState(null); 

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
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          const previewImg = document.getElementById('preview') as HTMLImageElement;
          if (previewImg) {
            previewImg.src = result;
          }
        };
        reader.readAsDataURL(target.files[0]);
      }
    };
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      // const formData = new FormData(e.target as HTMLFormElement);
      
      const dataJSON = JSON.stringify({
        email,
        nome,
        senha
      })

      try {
        const response = await fetch('http://localhost:3000/cadastrar', {
            method: 'POST',
            body: dataJSON,
            headers: {
              'Content-Type': 'application/json' 
            },
        });

        const isOk = JSON.parse(await response.text());

        if (isOk['message'] == 'ok') {
            alert('Cadastrado com sucesso');
            console.log(dataJSON);
        } else {
            alert('Cadastrado com erro');
            console.log(dataJSON);
        }

      } catch (error) {
          console.error('Erro ao enviar formulário: ', error);
          console.log(dataJSON);
      }
    }
  
  return (
    <>
      <section className='conteinerCadastrar'>
        <form encType="multipart/form-data" method="post" action="" onSubmit={handleSubmit}
        >
          <h1 className='titleForm'>Cadastrar</h1>
          <div className="img4-div">
            <div className="contenerimg" id="img-container4">
              <img id="preview" src={iconePadrao} alt="Ícone Padrão" />
            </div>
            <input
              className="file"
              id="img-input"
              type="file"
              name="img"
              accept="image/*"
              onChange={handleImageUpload}
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
