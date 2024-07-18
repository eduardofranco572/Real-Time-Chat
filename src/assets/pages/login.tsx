import '../css/global.css'
import '../css/login.css'
import React, { useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'

import CadastroForm from './cadastrar';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    
    const navigate = useNavigate();
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const dataJSON = JSON.stringify({
            email,
            senha
        })
    
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: dataJSON,
            redirect: 'follow'
        };
    
        try {
            const response = await fetch('http://localhost:3000/login', requestOptions);
    
            if (response.ok) {
                const responseData = await response.json();
                const { id } = responseData.user;
                localStorage.setItem('USU_ID', id);     
    
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
                    title: "Você foi logado na sua conta"
                });
    
                const url = `/home`;
                navigate(url);
            } else {
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
                    icon: "error",
                    title: "Usuário não cadastrado no sistema"
                });
            }
        } catch (error) {
            console.error('Erro ao fazer requisição:', error);
        }
    };
    
  return (
    <>
      <section className='conteinerLogar'>
        <form encType="multipart/form-data" method="post" action="" onSubmit={handleSubmit} 
        >
            <h1 className='titleForm'>Entrar</h1>
            <input
                className="inputinfos"
                type="email"
                name="email"
                placeholder="Digite seu email"
                value={email}
                onChange={validaEmail}
                required
            />
            <input
                className="inputinfos"
                type="password"
                name="senha"
                placeholder="Digite sua Senha"
                value={senha}
                onChange={validaSenha}
                required
            />
            <div className="cadastro">
                <p> É novo por aqui?</p>
                <div className="buttoncadastro">
                    <Link to={`/cadastrar`}><button>Cadastre-se</button></Link>
                </div>
                <Routes>
                    <Route path='/cadastrar' element={<CadastroForm/>}/>
                </Routes>
            </div>
            <div className="button">
                <input type="submit" value="Entrar" />
            </div>
        </form>

      </section>
     
    </>
  )
}

export default LoginForm
