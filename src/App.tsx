import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './assets/pages/login';
import CadastroForm from './assets/pages/cadastrar';
import Home from './assets/pages/home'; // Assumindo que você tem o arquivo home.tsx
import ProtectedRoute from './assets/controllers/authenticator'; // Ajuste o caminho conforme necessário

const App = () => {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route path="/cadastrar" element={<CadastroForm />} />
                <Route path="/login" element={<LoginForm />} />
            </Routes>
        </Router>
    );
};

export default App;

