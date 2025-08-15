import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Added imports for routing
import { useNotification } from './NotificationContext';
import { blockchains, type Blockchain } from '../lib/blockchains';
import { localDb } from '../lib/localDb';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user data
import { useLicense } from './LicenseContext'; // Assuming LicenseContext provides license status


interface BlockchainContextType {
  blockchain: Blockchain['id'] | null;
  setBlockchain: (chain: Blockchain['id'] | null) => void;
  resetBlockchain: () => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (value: boolean) => void;
  showWelcome: boolean;
  setShowWelcome: (value: boolean) => void;
  currentBlockchain: Blockchain | null;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [blockchain, setBlockchainState] = useState<Blockchain['id'] | null>(() => {
    try {
      const stored = localStorage.getItem('selected_blockchain');
      return stored ? (stored as Blockchain['id']) : null;
    } catch {
      return null;
    }
  });

  const currentBlockchain = blockchain ? blockchains[blockchain] : null;
  const [showWelcome, setShowWelcome] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { showNotification } = useNotification();
  const { hasActiveLicense, loadingProfile } = useAuth(); // Get license status from AuthContext
  const licenseContext = useLicense(); // Get license context

  // Verificar licença apenas se o licenseContext.syncLicenseStatus existir
  useEffect(() => {
    if (licenseContext && typeof licenseContext.syncLicenseStatus === 'function') {
      licenseContext.syncLicenseStatus();
      console.log('[BlockchainContext] Sincronizando status de licença');
    }
  }, [licenseContext]);

  const resetBlockchain = () => {
    setBlockchainState(null);
    setShowWelcome(false);
    localStorage.removeItem('selected_blockchain');
  };

  const handleSetBlockchain = (chain: Blockchain['id'] | null) => {
    // Store selected blockchain in local storage
    if (chain) {
      localStorage.setItem('selected_blockchain', chain);
      setShowWelcome(true);
    } else {
      localStorage.removeItem('selected_blockchain');
      setShowWelcome(false);
    }
    setBlockchainState(chain);
  };

  return (
    <BlockchainContext.Provider value={{ 
      blockchain,
      currentBlockchain,
      setBlockchain: handleSetBlockchain,
      resetBlockchain,
      showWelcome,
      setShowWelcome,
      showConfirmDialog,
      setShowConfirmDialog
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}


export function AppRoutes() {
  const { hasActiveLicense, loadingProfile } = useAuth();
  const { onboardingCompleted } = useAuth(); // Assuming onboarding status is in AuthContext
  const location = useLocation();


  if (loadingProfile || hasActiveLicense === null || onboardingCompleted === null) {
    return <div>Loading...</div>; // Show loading indicator while fetching data
  }

  if (hasActiveLicense) {
    return <Navigate to="/blockchain" state={{ from: location }} replace />;
  } else {
    return onboardingCompleted ? <Navigate to="/dashboard" state={{ from: location }} replace /> : <Navigate to="/welcome" state={{ from: location }} replace />;
  }
}