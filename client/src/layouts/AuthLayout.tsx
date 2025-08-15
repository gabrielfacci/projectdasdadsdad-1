import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReferralProvider } from '../context/ReferralContext';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import AuthSkeleton from '../components/ui/AuthSkeleton';

function AuthLayout() {
  const { user } = useAuth();
  const [isComponentReady, setIsComponentReady] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/welcome-verification" replace />;
  }

  // Show skeleton briefly to prevent white flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentReady(true);
    }, 100); // Brief delay to ensure smooth transition

    return () => clearTimeout(timer);
  }, []);

  if (!isComponentReady) {
    return <AuthSkeleton />;
  }

  return (
    <div 
      className="fade-in min-h-screen"
      style={{ backgroundColor: '#0d0a14' }}
    >
      <Routes>
        <Route path="/" element={
          <ReferralProvider>
            <Login onSuccess={() => {
              console.log('[AuthLayout] Login concluído, permitindo redirecionamento automático...');
            }} />
          </ReferralProvider>
        } />
        <Route path="/register" element={
          <ReferralProvider>
            <Register onSuccess={() => {
              // Não fazer reload, deixar o próprio componente Register gerenciar o redirecionamento
              console.log('[AuthLayout] Registro concluído, aguardando redirecionamento...');
            }} />
          </ReferralProvider>
        } />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
};

export default AuthLayout;