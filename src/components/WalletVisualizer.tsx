
import React from 'react';
import { Loader, CheckCircle2, XCircle, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shortenAddress, CryptoType } from '@/utils/walletUtils';

interface WalletVisualizerProps {
  status: 'idle' | 'checking' | 'no-balance' | 'has-balance' | 'unlocking' | 'unlocked';
  address: string;
  cryptoType?: CryptoType;
}

const WalletVisualizer: React.FC<WalletVisualizerProps> = ({ 
  status,
  address,
  cryptoType = 'bitcoin'
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-center font-medium">
              Checking wallet balance...
            </p>
            <p className="text-center text-muted-foreground text-sm mt-1">
              Looking for {cryptoType === 'bitcoin' ? 'BTC' : 'ETH'} on the blockchain
            </p>
          </div>
        );
      case 'no-balance':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <XCircle className="h-8 w-8 text-destructive mb-3" />
            <p className="text-center font-medium">
              No balance found
            </p>
            <p className="text-center text-muted-foreground text-sm mt-1">
              This wallet does not contain any {cryptoType === 'bitcoin' ? 'BTC' : 'ETH'}
            </p>
            <div className="mt-4 text-xs font-mono text-muted-foreground bg-muted p-2 rounded-md">
              {address}
            </div>
          </div>
        );
      case 'has-balance':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
            <p className="text-center font-medium">
              Balance found!
            </p>
            <p className="text-center text-muted-foreground text-sm mt-1">
              This wallet contains {cryptoType === 'bitcoin' ? 'BTC' : 'ETH'}
            </p>
            <div className="mt-4 text-xs font-mono text-green-600 bg-green-50 p-2 rounded-md">
              {address}
            </div>
          </div>
        );
      case 'unlocking':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Unlock className="h-8 w-8 text-primary mb-3 animate-pulse" />
            <p className="text-center font-medium">
              Unlocking wallet...
            </p>
            <p className="text-center text-muted-foreground text-sm mt-1">
              Preparing to access {cryptoType === 'bitcoin' ? 'BTC' : 'ETH'} funds
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all",
      status === 'has-balance' && "border-green-500",
      status === 'no-balance' && "border-red-200",
    )}>
      {getStatusDisplay()}
    </div>
  );
};

export default WalletVisualizer;
