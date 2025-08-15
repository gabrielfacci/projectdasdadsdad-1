import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { MiningProvider } from './context/MiningContext';
import { LicenseProvider } from './context/LicenseContext';
import { TourProvider } from './context/TourContext';
import { ReferralProvider } from './context/ReferralContext';
import { TutorialProvider } from './context/TutorialContext';
import BlockchainSelector from './components/BlockchainSelector';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import TourWelcome from './components/tour/TourWelcome';
import Welcome from './components/onboarding/Welcome';
import Dashboard from './components/Dashboard';
import Mining from './components/Mining';
import Settings from './components/Settings';
import Referrals from './components/Referrals';
import OnboardingQuiz from './components/onboarding/quizNoLicense/OnboardingQuiz';
import { OnboardingProvider } from './context/OnboardingContext';
import ProfileApproval from './components/onboarding/quizNoLicense/ProfileApproval';
import LicenseRequired from './components/LicenseRequired';
import WelcomeVerification from './components/WelcomeVerification';
import LogoutPage from './components/LogoutPage';
import LoadingScreen from './components/LoadingScreen';

export default function AppRoutes() {
  const { loading, user, profile } = useAuth();

  // Logs para depuração (apenas uma vez por mudança)
  const debugKey = `${user?.email}-${profile?.hasActiveLicense}-${profile?.onboarding_completed}`;
  const lastDebugKey = React.useRef<string>('');
  
  if (user && profile && debugKey !== lastDebugKey.current) {
    lastDebugKey.current = debugKey;
    console.log('[GhostWallet][Routes] Status do usuário:', {
      email: user?.email,
      hasActiveLicense: profile?.hasActiveLicense === true ? 'SIM ✅' : 'NÃO ❌',
      onboarding_completed: profile?.onboarding_completed === true ? 'SIM' : 'NÃO',
    });
  }

  if (loading) {
    return (
      <div 
        className="fade-in min-h-screen"
        style={{ backgroundColor: '#0d0a14' }}
      >
        <LoadingScreen />
      </div>
    );
  }

  // Not logged in - show auth
  if (!user) {
    return (
      <Routes>
        <Route path="/auth/*" element={<AuthLayout />} />
        <Route path="/welcome-verification" element={<WelcomeVerification />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Admin user in admin mode
  if (user.role === 'admin' && profile?.adminMode) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // Usuário com licença ativa - mostrar app completo
  if (profile?.hasActiveLicense === true) {
    console.log('[GhostWallet][Routes] Usuário COM licença ativa ✅ - Roteando para app completo');
    return (
      <LicenseProvider>
        <BlockchainProvider>
          <MiningProvider>
            <TourProvider>
              <ReferralProvider>
                <TutorialProvider>
                  <Routes>
                    <Route path="/app/*" element={<UserLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="mining" element={<Mining />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="referrals" element={<Referrals />} />
                    </Route>
                    <Route path="/blockchain" element={<BlockchainSelector />} />
                    <Route path="/license-required" element={<LicenseRequired />} />
                    <Route path="/tour" element={<TourWelcome />} />
                    <Route path="/logout" element={<LogoutPage />} />
                    {/* CORREÇÃO: Se o usuário tem licença, sempre redirecione para blockchain primeiro */}
                    <Route path="*" element={<Navigate to="/blockchain" replace />} />
                  </Routes>
                </TutorialProvider>
              </ReferralProvider>
            </TourProvider>
          </MiningProvider>
        </BlockchainProvider>
      </LicenseProvider>
    );
  }

  // Usuário sem licença - verificar se já concluiu o onboarding
  if (profile?.onboarding_completed) {
    console.log('[GhostWallet][Routes] Usuário sem licença COM onboarding concluído - Exibindo tela de licença requerida');
    return (
      <LicenseProvider>
        <Routes>
          <Route path="/licenca-requerida" element={<LicenseRequired />} />
          <Route path="/onboarding" element={<Navigate to="/licenca-requerida" replace />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<Navigate to="/licenca-requerida" replace />} />
        </Routes>
      </LicenseProvider>
    );
  } else {
    console.log('[GhostWallet][Routes] Usuário sem licença SEM onboarding concluído - Redirecionando para onboarding');
    return (
      <LicenseProvider>
        <OnboardingProvider>
          <Routes>
            <Route path="/onboarding" element={<OnboardingQuiz />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </OnboardingProvider>
      </LicenseProvider>
    );
  }
}