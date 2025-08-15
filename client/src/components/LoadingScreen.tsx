import React from 'react';
import { Ghost, Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden fade-in"
      style={{ backgroundColor: '#0d0a14' }}
    >
      {/* Ghost Background Effects */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(123, 104, 238, 0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 112, 219, 0.15), transparent 50%), linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
        }}
      />
      
      {/* Floating Ghost Orbs */}
      <div 
        className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(123, 104, 238, 0.1)' }}
      />
      <div 
        className="absolute bottom-20 right-20 w-48 h-48 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(147, 112, 219, 0.1)', animationDelay: '1s' }}
      />

      <div className="text-center relative z-10">
        <div className="relative inline-block mb-6">
          <Ghost 
            className="w-16 h-16 ghost-logo animate-bounce" 
            style={{ 
              color: 'var(--ghost-primary)',
              filter: 'drop-shadow(0 0 20px rgba(123, 104, 238, 0.5))'
            }} 
          />
          <Sparkles 
            className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" 
            style={{ animationDelay: '0.5s' }}
          />
        </div>
        
        <div className="space-y-2">
          <h2 
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--ghost-primary), var(--ghost-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Ghost Wallet
          </h2>
          <p className="text-neutral-400 animate-pulse">Carregando sua carteira...</p>
        </div>

        {/* Loading Animation */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full animate-bounce"
                style={{
                  backgroundColor: 'var(--ghost-primary)',
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}