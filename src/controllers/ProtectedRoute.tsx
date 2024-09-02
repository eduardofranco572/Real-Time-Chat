import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
        };

        const verificaAuth = async () => {
            try {
                const response = await fetch('http://localhost:3000/protected', requestOptions);
                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.log('Erro ao verificar autenticação:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verificaAuth();
    }, []);

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <>{props.children}</>;
};

export default ProtectedRoute;
