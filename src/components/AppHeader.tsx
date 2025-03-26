
import React from 'react';
import { Link } from 'react-router-dom';
import { Bitcoin, Info, Loader } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import CryptoNavigation from '@/components/CryptoNavigation';
import { CryptoType } from '@/utils/walletUtils';

interface AppHeaderProps {
  activeCrypto: CryptoType;
  onCryptoChange: (crypto: CryptoType) => void;
  isAccessUnlocked: boolean;
  onToggleUnlock: () => void;
  btcPrice: number | null;
  isPriceLoading: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  activeCrypto,
  onCryptoChange,
  isAccessUnlocked,
  onToggleUnlock,
  btcPrice,
  isPriceLoading
}) => {
  const getCryptoIcon = () => {
    return activeCrypto === 'bitcoin' ? 
      <Bitcoin className="h-5 w-5 text-bitcoin" /> : 
      <div className="h-5 w-5 text-ethereum">₿</div>;
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          {getCryptoIcon()}
          <h1 className="text-xl font-medium tracking-tight">
            Quantum Crypto Keybreaker
          </h1>
          <Link to="/about" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <Info className="h-4 w-4 mr-1" />
            About
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Bitcoin className="h-5 w-5 text-bitcoin" />
          <span className="font-medium">
            BTC {isPriceLoading ? (
              <Loader className="h-3 w-3 animate-spin inline" />
            ) : (
              `$${btcPrice ? btcPrice.toLocaleString() : '0'}`
            )}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <CryptoNavigation 
            activeCrypto={activeCrypto} 
            onCryptoChange={onCryptoChange}
            isAccessUnlocked={isAccessUnlocked}
            onToggleUnlock={onToggleUnlock}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
