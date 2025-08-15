import React, { useState, useEffect } from 'react';
import { Ghost, Sparkles, Lock, Shield, Zap, Check } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

interface LicenseVerificationProps {
  onComplete: () => void;
}

export default function LicenseVerification({ onComplete }: LicenseVerificationProps) {
  const { refreshLicenses } = useLicense();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { text: 'Conectando ao servidor...', icon: Ghost },
    { text: 'Verificando licenças...', icon: Lock },
    { text: 'Validando acesso...', icon: Shield },
    { text: 'Inicializando...', icon: Zap }
  ];

  useEffect(() => {
    const verifyLicenses = async () => {
      try {
        // Artificial delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 500));
        setStep(1);

        // Refresh licenses
        await refreshLicenses();
        await new Promise(resolve => setTimeout(resolve, 500));
        setStep(2);

        // Additional verification step
        await new Promise(resolve => setTimeout(resolve, 500));
        setStep(3);

        // Final delay before completion
        await new Promise(resolve => setTimeout(resolve, 500));
        onComplete();
      } catch (err) {
        console.error('License verification error:', err);
        setError('Erro ao verificar licenças. Por favor, tente novamente.');
      }
    };

    verifyLicenses();
  }, [refreshLicenses, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Ghost className="w-24 h-24 mx-auto text-primary ghost-logo mb-6" />
            <div className="absolute -right-4 -top-4">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold ghost-text mb-2">Ghost Wallet</h1>
          <p className="text-neutral-400">Verificando suas licenças...</p>
        </div>

        <div className="ghost-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse" />
          
          <div className="relative">
            {/* Animated Icons */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                {React.createElement(steps[step].icon, {
                  className: "w-8 h-8 text-primary animate-spin-slow"
                })}
              </div>
            </div>

            {/* Loading Steps */}
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                    i === step ? 'bg-background-light/30' : 
                    i < step ? 'opacity-50' : 'opacity-30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i === step ? 'bg-primary/20' :
                    i < step ? 'bg-success/20' : 'bg-background-light/20'
                  }`}>
                    {i < step ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : React.createElement(s.icon, {
                      className: `w-4 h-4 ${i === step ? 'text-primary' : 'text-neutral-400'}`
                    })}
                  </div>
                  <span className={i === step ? 'text-white' : 'text-neutral-400'}>
                    {s.text}
                  </span>
                  {i === step && (
                    <div className="flex-1 flex justify-end">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-6 text-center text-danger">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary mt-4"
                >
                  Tentar Novamente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}