import React from 'react';
import { Ghost, Activity, Gift, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Top Navigation */}
      <nav className="bg-background-card/50 backdrop-blur-md border-b border-neutral-700/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Ghost className="w-8 h-8 text-primary ghost-logo" />
              <span className="text-lg font-bold ghost-text">Ghost Wallet</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut()}
                className="btn bg-background-light hover:bg-background-light/80"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background-card/50 backdrop-blur-md border-t border-neutral-700/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <button className="nav-item nav-mineracao active">
              <Activity className="w-6 h-6" />
              <span className="text-xs">{t('navigation.mining')}</span>
            </button>
            <button className="nav-item nav-referencias">
              <Gift className="w-6 h-6" />
              <span className="text-xs">{t('navigation.referrals')}</span>
            </button>
            <button className="nav-item nav-configuracoes">
              <Settings className="w-6 h-6" />
              <span className="text-xs">{t('navigation.settings')}</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}