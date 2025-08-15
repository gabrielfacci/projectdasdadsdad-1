import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { initFacebookPixel, trackPageView } from './lib/pixel'; // ✅ novo
import { captureUTMs } from './lib/utils';
import LicenseDebugger from './components/LicenseDebugger';
import TopBar from './components/TopBar';
import './i18n'; // Initialize i18n
import './index.css';

function App() {
  useEffect(() => {
    initFacebookPixel(); // Inicializa o Pixel
    trackPageView();     // Dispara visualização de página
    captureUTMs();      // Captura parâmetros UTM
    
    // Check for forced logout
    const shouldForceLogout = window.location.search.includes('force-logout=true');
    
    if (shouldForceLogout) {
      console.log('Executando logout forçado...');
      
      // Limpar todos os dados do localStorage
      const keysToRemove = [
        'ghost-wallet-user',
        'ghost-wallet-session', 
        'ghost-wallet-profile',
        'ghost-wallet-license-status',
        'ghost-wallet-blockchain-access',
        'supabase.auth.token',
        'sb-supabase-auth-token',
        'utmify_data',
        'ghost-wallet-onboarding'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removido: ${key}`);
      });
      
      // Limpar sessionStorage
      sessionStorage.clear();
      console.log('SessionStorage limpo');
      
      // Redirecionar para auth após um breve delay
      setTimeout(() => {
        console.log('Logout concluído, redirecionando...');
        window.location.href = '/auth';
      }, 1000);
    }
  }, []);

  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <OnboardingProvider>
            <TopBar />
            <div className="pt-16"> {/* Add padding top to avoid overlap with fixed TopBar */}
              <AppRoutes />
            </div>
            {/* <LicenseDebugger /> */}
          </OnboardingProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
