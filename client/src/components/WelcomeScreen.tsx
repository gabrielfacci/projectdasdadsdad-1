import React from "react";
import { Ghost, Sparkles, ArrowRight, X, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBlockchain } from "../context/BlockchainContext";
import { useTranslation } from "../hooks/useTranslation";

interface WelcomeScreenProps {
  onClose: () => void;
}

export default function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  const { profile } = useAuth();
  const { currentBlockchain } = useBlockchain();
  const { t } = useTranslation();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0d0a14' }}
    >
      {/* Background Effects - Ghost Theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(123, 104, 238, 0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 112, 219, 0.15), transparent 50%), linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
        }}
      />
      
      {/* Ghost floating animations */}
      <div 
        className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(123, 104, 238, 0.1)' }}
      />
      <div 
        className="absolute bottom-40 right-32 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
        style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)' }}
      />
      
      <div className="relative z-10 max-w-lg w-full">
        <div className="text-center mb-8 animate-ghostAppear">
          <div className="relative inline-block">
            <div className="relative">
              <Ghost 
                className="w-24 h-24 mx-auto mb-6" 
                style={{ color: 'var(--ghost-primary)' }}
              />
              <div className="absolute -right-4 -top-4">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <div className="absolute -right-4 -top-4">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 
              className="text-4xl font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {profile?.name
                ? t('welcome.backWithName', { name: profile.name })
                : t('welcome.back')}
            </h1>
            <div className="flex-col items-center gap-2">
              {currentBlockchain && (
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border animate-ghostSlideIn"
                  style={{
                    backgroundColor: 'rgba(39, 39, 42, 0.3)',
                    borderColor: 'rgba(123, 104, 238, 0.3)'
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${currentBlockchain.color}20` }}
                  >
                    <currentBlockchain.icon
                      className="w-4 h-4"
                      style={{ color: currentBlockchain.color }}
                    />
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: currentBlockchain.color }}
                  >
                    {currentBlockchain.name}
                  </span>
                </div>
              )}
              <p className="text-neutral-400">
                {t('miningExtras.continueJourney')}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="p-6 animate-ghostSlideIn relative overflow-hidden rounded-2xl border backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(123, 104, 238, 0.1)'
          }}
        >
          <div 
            className="absolute inset-0 animate-pulse" 
            style={{
              background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
            }}
          />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'transparent',
              color: '#9CA3AF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            <X className="w-5 h-5 text-neutral-400 hover:text-white" />
          </button>

          <div className="relative flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
            >
                <Ghost 
                  className="w-6 h-6" 
                  style={{ color: 'var(--ghost-primary)' }}
                />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Redirecionando para</p>
                <p 
                  className="font-medium"
                  style={{
                    background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  Dashboard
                </p>
              </div>
            </div>
            <ChevronRight 
              className="w-6 h-6 animate-pulse" 
              style={{ color: 'var(--ghost-primary)' }}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 group py-3 px-6 rounded-lg font-semibold transition-all duration-300 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
              border: 'none',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(123, 104, 238, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(123, 104, 238, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(123, 104, 238, 0.3)';
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-2">
              <span>Começar a Minerar</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
