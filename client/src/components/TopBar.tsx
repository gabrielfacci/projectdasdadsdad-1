import React from 'react';
import { Ghost } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

interface TopBarProps {
  className?: string;
}

const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md border-b ${className}`}
      style={{
        backgroundColor: 'rgba(13, 10, 20, 0.9)',
        borderBottomColor: 'rgba(123, 104, 238, 0.2)'
      }}
    >
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
        >
          <Ghost 
            className="w-5 h-5" 
            style={{ color: 'var(--ghost-primary)' }}
          />
        </div>
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

      {/* Language Selector */}
      <div>
        <LanguageSelector variant="dropdown" showText={false} />
      </div>
    </div>
  );
};

export default TopBar;