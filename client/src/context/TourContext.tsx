import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLicense } from './LicenseContext';
import { useNotification } from './NotificationContext';
import { blockchains } from '../lib/blockchains';

const blockchainIds = Object.values(blockchains).map(chain => chain.id);

interface TourContextType {
  isTourMode: boolean;
  setTourMode: (enabled: boolean) => void;
  hasAnyAccess: boolean;
  showTourButton: boolean;
  startTour: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { checkBlockchainAccess } = useLicense();
  const { showNotification } = useNotification();
  const [isTourMode, setIsTourMode] = useState(false);
  const [hasAnyAccess, setHasAnyAccess] = useState(true);
  const [showTourButton, setShowTourButton] = useState(false);

  // Check if user has access to any blockchain
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.email) return;

      try {
        const blockchains = ['solana', 'bitcoin', 'ethereum', 'bsc', 'cardano', 'polkadot'];
        const accessPromises = blockchains.map(chain => checkBlockchainAccess(chain));
        const accessResults = await Promise.all(accessPromises);
        
        const hasAccess = accessResults.some(result => result);
        setHasAnyAccess(hasAccess);
        setShowTourButton(!hasAccess);
      } catch (error) {
        console.error('Error checking blockchain access:', error);
      }
    };

    checkAccess();
  }, [user?.email, checkBlockchainAccess]);

  // Load tour mode state from localStorage
  useEffect(() => {
    const tourMode = localStorage.getItem('tour_mode') === 'true';
    setIsTourMode(tourMode);
  }, []);

  const handleSetTourMode = (enabled: boolean) => {
    setIsTourMode(enabled);
    if (enabled) {
      localStorage.setItem('tour_mode', 'true');
    } else {
      localStorage.removeItem('tour_mode');
    }
  };

  const startTour = () => {
    handleSetTourMode(true);
    showNotification({
      type: 'success',
      title: 'Modo Tour Ativado',
      message: 'Explore todas as funcionalidades gratuitamente!'
    });
  };

  const endTour = () => {
    handleSetTourMode(false);
    showNotification({
      type: 'info',
      title: 'Modo Tour Finalizado',
      message: 'Ative sua licença para continuar minerando!'
    });
  };

  return (
    <TourContext.Provider value={{
      isTourMode,
      setTourMode: handleSetTourMode,
      hasAnyAccess,
      showTourButton,
      startTour,
      endTour
    }}>
      {children}
    </TourContext.Provider>
  );
}