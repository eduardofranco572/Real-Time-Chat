import '../assets/css/global.css'
import '../assets/css/login.css'
import React, { FormEvent, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ProfileImageEditor from '../features/ProfileImageEditor';

import iconePadrao from '../assets/img/iconePadrao.svg';
import LoginForm from './login';

function CadastroForm() {
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isSenhaValid, setIsSenhaValid] = useState<boolean>(false);

  const [imagePreview, setImagePreview] = useState<string>(iconePadrao);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  const navigate = useNavigate();

  const validaEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const valid = value.length >= 8 && regex.test(value);
    setIsEmailValid(valid);
    e.target.style.borderColor = valid ? '#1CC88A' : 'red';
  };

  const validaSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSenha(value);
    const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W+).{6,50}/;
    const valid = value.length >= 8 && regex.test(value);
    setIsSenhaValid(valid);
    e.target.style.borderColor = valid ? '#1CC88A' : 'red';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result as string | null;
      if (result) {
        setRawImage(result);
        setEditing(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = (file: File): void => {
    setCroppedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setEditing(false);
  };

  const handleCancelEdit = (): void => {
    setEditing(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('senha', senha);
    if (croppedFile) {
      formData.append('img', croppedFile);
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/cadastrar', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.message === 'ok') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          icon: 'success',
          title: 'Cadastrado com sucesso'
        });
        navigate('/login');
      } else if (result.message === 'email') {
        Swal.fire({
          icon: 'error',
          title: 'E-mail já cadastrado!',
          text: 'Este endereço de e-mail já está cadastrado no nosso sistema. Faça login para continuar!'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Algum erro inesperado, tente novamente!'
        });
      }
    } catch (err) {
      console.error('Erro ao enviar formulário: ', err);
      Swal.fire({ icon: 'error', title: 'Erro de rede', text: 'Não foi possível conectar ao servidor.' });
    }
  };

  return (
    <>
      {editing && rawImage && (
        <ProfileImageEditor
          image={rawImage}
          onSave={handleSaveImage}
          onCancel={handleCancelEdit}
        />
      )}

      <section className='backgroundLogin' />
      <section className='conteinerCadastrar'>
        <form className='formLogin' encType='multipart/form-data' onSubmit={handleSubmit}>
          <h1 className='titleForm'>Cadastrar</h1>
          <p className='subtitleFormLogin'>Bem-vindo! Para continuar, preencha seus dados.</p>

          <div className='alingInputsFormLogin'>
            <div className='img4-div'>
              <div className='contenerimg' onClick={() => document.getElementById('img-input')?.click()}>
                <img src={imagePreview} alt='Preview' />
              </div>
              <input
                id='img-input'
                type='file'
                accept='image/*'
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            <input
              className='inputinfos'
              type='text'
              name='nome'
              placeholder='Digite seu Nome'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              className='inputinfos'
              type='email'
              name='email'
              placeholder='Digite seu email'
              value={email}
              onChange={validaEmail}
              onBlur={validaEmail}
              required
            />
            <input
              className='inputinfos'
              type='password'
              name='senha'
              placeholder='Digite sua Senha'
              value={senha}
              onChange={validaSenha}
              onBlur={validaSenha}
              required
            />
          </div>

          <div className='button'>
            <input type='submit' value='Cadastrar' disabled={!isEmailValid || !isSenhaValid} />
          </div>

          <div className='cadastro'>
            <p>Já possui uma conta?</p>
            <div className='buttoncadastro'>
              <Link to='/login'><button type='button'>Entrar</button></Link>
            </div>
            <Routes>
              <Route path='/login' element={<LoginForm />} />
            </Routes>
          </div>
        </form>
      </section>
    </>
  );
}

export default CadastroForm;