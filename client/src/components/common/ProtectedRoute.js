import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, loading, isAuthorized } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (role && !isAuthorized(role)) {
    if (currentUser.role === 'DONOR') {
      return <Navigate to="/donor/dashboard" />;
    } else if (currentUser.role === 'SEEKER') {
      return <Navigate to="/seeker/dashboard" />;
    } else if (currentUser.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" />;
    }

    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;