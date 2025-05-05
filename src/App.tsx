import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './pages/login';
import CadastroForm from './pages/cadastrar';
import Home from './pages/home'; 
import ProtectedRoute from './controllers/ProtectedRoute';

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
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<LoginForm />} />
            </Routes>
        </Router>
    );
};

export default App;
