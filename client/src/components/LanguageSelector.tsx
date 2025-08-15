import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'inline';
  showFlag?: boolean;
  showText?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '',
  variant = 'dropdown',
  showFlag = true,
  showText = true
}) => {
  const { changeLanguage, getLanguageOptions, getCurrentLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = getLanguageOptions();
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
              ${currentLang.code === lang.code 
                ? 'bg-primary/20 border border-primary/30 text-primary' 
                : 'bg-background/60 border border-neutral-700/50 text-neutral-400 hover:text-white hover:border-primary/30'
              }
            `}
          >
            {showFlag && <span className="text-lg">{lang.flag}</span>}
            {showText && <span className="text-sm font-medium">{lang.name}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          text-neutral-400 hover:text-white hover:border-primary/30
          transition-all duration-200 backdrop-blur-sm relative z-10
        "
        style={{
          backgroundColor: 'rgba(39, 39, 42, 0.8)',
          borderColor: 'rgba(123, 104, 238, 0.3)',
          border: '1px solid'
        }}
      >
        <Globe className="w-4 h-4" />
        {showFlag && <span className="text-lg">{currentLang.flag}</span>}
        {showText && <span className="text-sm font-medium">{currentLang.name}</span>}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute top-full mt-2 right-0 z-50 min-w-[180px] rounded-lg shadow-xl backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(39, 39, 42, 0.95)',
              borderColor: 'rgba(123, 104, 238, 0.3)',
              border: '1px solid'
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  transition-all duration-200 first:rounded-t-lg last:rounded-b-lg
                  ${currentLang.code === lang.code 
                    ? 'text-white border-l-2' 
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
                style={{
                  backgroundColor: currentLang.code === lang.code 
                    ? 'rgba(123, 104, 238, 0.2)' 
                    : 'transparent',
                  borderLeftColor: currentLang.code === lang.code 
                    ? 'var(--ghost-primary)' 
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (currentLang.code !== lang.code) {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 55, 58, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentLang.code !== lang.code) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="text-xl">{lang.flag}</span>
                <div>
                  <div className="text-sm font-medium">{lang.name}</div>
                  <div className="text-xs text-neutral-500">{lang.nativeName}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;