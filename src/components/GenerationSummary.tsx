
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import WalletVisualizer from '@/components/WalletVisualizer';
import { CryptoType } from '@/utils/walletUtils';

interface MetricsProps {
  totalWallets: number;
  autoCount: number;
  successRate: number;
  totalGenerations: number;
}

interface GenerationSummaryProps {
  metrics: MetricsProps;
  walletStatus: 'idle' | 'checking' | 'no-balance' | 'has-balance' | 'unlocking' | 'unlocked';
  address: string;
  cryptoType: CryptoType;
}

const GenerationSummary: React.FC<GenerationSummaryProps> = ({
  metrics,
  walletStatus,
  address,
  cryptoType
}) => {
  return (
    <div className="space-y-4 animate-fade-up">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Generation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-muted-foreground">Total Wallets:</span>
              <span className="font-semibold ml-2">{metrics.totalWallets}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Auto Generations:</span>
              <span className="font-semibold ml-2">{metrics.autoCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="font-semibold ml-2">
                {metrics.successRate.toFixed(2)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                ({metrics.totalWallets}/{metrics.totalGenerations})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <WalletVisualizer status={walletStatus} address={address} cryptoType={cryptoType} />
      </div>
    </div>
  );
};

export default GenerationSummary;
