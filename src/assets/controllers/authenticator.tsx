import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
    const userId = localStorage.getItem('USU_ID');
    if (!userId) {
        return <Navigate to="/login" />;
    }
    return <>{props.children}</>;
};

export default ProtectedRoute;
