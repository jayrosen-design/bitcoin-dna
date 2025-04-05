
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
          <Dna className="h-5 w-5 text-bitcoin mr-2" />
          <Link to="/" className="text-xl font-medium tracking-tight hover:text-primary/80 transition-colors">
            Bitcoin DNA
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
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link to="/about" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/gallery" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            Gallery
          </Link>
          <Link to="/btc-dna" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            Create
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
