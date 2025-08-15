import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Ghost, Activity, Gift, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { useMining } from '../context/MiningContext';
import WelcomeScreen from '../components/WelcomeScreen';
import Welcome from '../components/onboarding/Welcome';
import BlockchainSelector from '../components/BlockchainSelector';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import UpgradeMiningPopup from '../components/ui/UpgradeMiningPopup';
import Mining from '../components/Mining';
import Dashboard from '../components/Dashboard';
import Referrals from '../components/Referrals';
import Settings from '../components/Settings';

interface UserLayoutProps {
  disableMining?: boolean;
}

export default function UserLayout({ disableMining }: UserLayoutProps) {
  const { user, profile, loading, signOut, session, checkAuth } = useAuth();
  const { blockchain, resetBlockchain, showWelcome, setShowWelcome, showConfirmDialog, setShowConfirmDialog } = useBlockchain();
  const { isRunning, setIsRunning } = useMining();
  const [activeView, setActiveView] = React.useState<'dashboard' | 'mining' | 'referrals' | 'settings'>('dashboard');
  const [showUpgradePopup, setShowUpgradePopup] = React.useState(false);

  const handleBlockchainChange = () => {
    if (isRunning) {
      setShowConfirmDialog(true);
    } else {
      resetBlockchain();
    }
  };

  const handleConfirmChange = () => {
    setIsRunning(false);
    resetBlockchain();
    setShowConfirmDialog(false);
  };

  const handleViewChange = (view: typeof activeView) => {
    if (view === 'mining' && disableMining) {
      setShowUpgradePopup(true);
    } else {
      setActiveView(view);
    }
  };

  // Verify authentication periodically
  React.useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        signOut();
      }
    };

    if (!loading && session) {
      verifyAuth();
      const interval = setInterval(verifyAuth, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, session, checkAuth, signOut]);

  // Protect user routes
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect admin to admin panel if in admin mode
  if (user?.role === 'admin' && profile?.adminMode) {
    return <Navigate to="/admin" replace />;
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial">
        <div className="animate-pulse">
          <Ghost className="w-16 h-16 text-[#6C63FF] ghost-logo" />
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (!profile.name) {
    return <Welcome onComplete={() => window.location.reload()} />;
  }

  // Show blockchain selector for licensed users without blockchain selected
  if (profile.hasActiveLicense && !blockchain) {
    return <BlockchainSelector />;
  }

  // Show welcome screen after blockchain selection
  if (showWelcome && blockchain) {
    return <WelcomeScreen onClose={() => setShowWelcome(false)} />;
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#0d0a14' }}
    >
      {/* Background Effects - Enhanced Ghost Theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 20% 80%, rgba(123, 104, 238, 0.15), transparent 50%),
            radial-gradient(ellipse 1000px 800px at 80% 20%, rgba(147, 112, 219, 0.15), transparent 50%),
            radial-gradient(ellipse 600px 400px at 50% 50%, rgba(139, 92, 246, 0.1), transparent 70%),
            radial-gradient(ellipse 400px 300px at 10% 30%, rgba(168, 85, 247, 0.08), transparent 60%),
            radial-gradient(ellipse 500px 350px at 90% 70%, rgba(124, 58, 237, 0.08), transparent 60%),
            linear-gradient(135deg, rgba(123, 104, 238, 0.04), rgba(147, 112, 219, 0.04)),
            linear-gradient(45deg, rgba(139, 92, 246, 0.02), transparent 30%),
            conic-gradient(from 180deg at 50% 50%, rgba(123, 104, 238, 0.06), rgba(147, 112, 219, 0.06), rgba(139, 92, 246, 0.06), rgba(123, 104, 238, 0.06))
          `
        }}
      />
      
      {/* Ghost floating animations */}
      <div 
        className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"
        style={{ 
          backgroundColor: 'rgba(123, 104, 238, 0.08)',
          animation: 'ghost-pulse 4s ease-in-out infinite'
        }}
      />
      <div 
        className="absolute bottom-40 right-32 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
        style={{ 
          backgroundColor: 'rgba(147, 112, 219, 0.08)',
          animation: 'ghost-pulse 6s ease-in-out infinite reverse'
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse delay-2000"
        style={{ 
          backgroundColor: 'rgba(139, 92, 246, 0.06)',
          animation: 'ghost-pulse 5s ease-in-out infinite alternate'
        }}
      />

      {/* Top Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md border-b"
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.8)',
          borderColor: 'rgba(123, 104, 238, 0.2)',
          boxShadow: '0 4px 16px rgba(123, 104, 238, 0.1)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Ghost 
                className="w-8 h-8" 
                style={{ color: 'var(--ghost-primary)' }}
              />
              <span 
                className="text-lg font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Ghost Wallet
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut()}
                className="relative overflow-hidden group px-3 py-2 rounded-lg font-medium transition-all duration-300 mr-2 backdrop-blur-md border"
                style={{
                  backgroundColor: 'rgba(55, 55, 58, 0.4)',
                  borderColor: 'rgba(123, 104, 238, 0.3)',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.7)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.4)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="relative flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Sair</span>
                </div>
              </button>

              {profile.hasActiveLicense && blockchain && (
                <button
                  onClick={handleBlockchainChange}
                  className="relative overflow-hidden group px-3 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-md border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.2), rgba(147, 112, 219, 0.2))',
                    borderColor: 'rgba(123, 104, 238, 0.4)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(123, 104, 238, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(123, 104, 238, 0.3), rgba(147, 112, 219, 0.3))';
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 104, 238, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(123, 104, 238, 0.2), rgba(147, 112, 219, 0.2))';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(123, 104, 238, 0.1)';
                  }}
                >
                  <div className="relative flex items-center gap-2">
                    <Ghost 
                      className="w-5 h-5" 
                      style={{ color: 'var(--ghost-primary)' }}
                    />
                    <span className="hidden sm:inline">Trocar Blockchain</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-24 relative z-10">
        <div className="px-2 sm:px-4">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'mining' && profile.hasActiveLicense && blockchain && <Mining />}
          {activeView === 'referrals' && <Referrals />}
          {activeView === 'settings' && <Settings />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none z-50">
        <div className="max-w-sm mx-auto">
          <nav 
            className="backdrop-blur-md border rounded-2xl shadow-xl pointer-events-auto"
            style={{
              backgroundColor: 'rgba(39, 39, 42, 0.95)',
              borderColor: 'rgba(123, 104, 238, 0.3)',
              boxShadow: '0 20px 40px rgba(123, 104, 238, 0.2), 0 10px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(123, 104, 238, 0.1)'
            }}
          >
            <div className="grid grid-cols-4 p-1">
              <button 
                className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleViewChange('dashboard')}
              >
                <div className="nav-icon-wrapper">
                  <Ghost className="nav-icon" />
                </div>
                <span className="nav-label">Dashboard</span>
              </button>
              <button 
                className={`nav-item ${activeView === 'mining' ? 'active' : ''}`}
                onClick={() => handleViewChange('mining')}
              >
                <div className="nav-icon-wrapper">
                  <Activity className="nav-icon" />
                </div>
                <span className="nav-label">Mineração</span>
              </button>
              <button 
                className={`nav-item ${activeView === 'referrals' ? 'active' : ''}`}
                onClick={() => handleViewChange('referrals')}
              >
                <div className="nav-icon-wrapper">
                  <Gift className="nav-icon" />
                </div>
                <span className="nav-label">Referências</span>
              </button>
              <button 
                className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
                onClick={() => handleViewChange('settings')}
              >
                <div className="nav-icon-wrapper">
                  <SettingsIcon className="nav-icon" />
                </div>
                <span className="nav-label">Configurações</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmChange}
        title="Interromper Mineração?"
        message="Para alterar a blockchain, precisamos interromper a mineração atual. Deseja continuar?"
      />

      <UpgradeMiningPopup
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
      />
    </div>
  );
}