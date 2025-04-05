
import React from 'react';
import { Link } from 'react-router-dom';
import { Bitcoin, Dna, Loader } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Bitcoin className="h-5 w-5 text-bitcoin mr-2" />
          <Link to="/" className="text-xl font-medium tracking-tight hover:text-primary/80 transition-colors">
            Quantum Crypto Keybreaker
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
        
        <div className="flex items-center space-x-4">
          <Link to="/btc-dna" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <Dna className="h-4 w-4 mr-1" />
            BTC DNA
          </Link>
          <Link to="/about" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/matrix" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H6V22H2V2Z" className="fill-current" fillOpacity="0.5" />
              <path d="M10 2H14V22H10V2Z" className="fill-current" fillOpacity="0.5" />
              <path d="M18 2H22V22H18V2Z" className="fill-current" fillOpacity="0.5" />
              <path d="M4 8V16H4.5V8H4Z" className="fill-current" />
              <path d="M12 4V20H12.5V4H12Z" className="fill-current" />
              <path d="M20 6V18H20.5V6H20Z" className="fill-current" />
            </svg>
            Matrix
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
