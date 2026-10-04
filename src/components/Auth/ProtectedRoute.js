import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; // Could replace with a better spinner
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
