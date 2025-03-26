
import React from 'react';
import { Bitcoin, Coins } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StatusCardsProps {
  totalValueUnlocked: {
    btc: number;
    usd: number;
    wallets: number;
    totalSeedPhrases: number;
  };
  metrics: {
    totalBTC: number;
    btcValue: number;
    bitcoinWallets: number;
    totalGenerations: number;
  };
}

const StatusCards: React.FC<StatusCardsProps> = ({ totalValueUnlocked, metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Coins className="h-5 w-5 text-bitcoin" />
            Total Value Unlocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">BTC Unlocked:</span>
              <span className="font-medium">{totalValueUnlocked.btc.toFixed(8)} BTC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">USD Value:</span>
              <span className="font-medium">${totalValueUnlocked.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Wallets:</span>
              <span className="font-medium">{totalValueUnlocked.wallets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Seed Phrases Unlocked:</span>
              <span className="font-medium">{totalValueUnlocked.totalSeedPhrases.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Bitcoin className="h-5 w-5 text-bitcoin" />
            My BTC Unlocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">BTC Found:</span>
              <span className="font-medium">{metrics.totalBTC.toFixed(8)} BTC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">USD Value:</span>
              <span className="font-medium">${metrics.btcValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wallets Unlocked:</span>
              <span className="font-medium">{metrics.bitcoinWallets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Seed Phrases Unlocked:</span>
              <span className="font-medium">{metrics.totalGenerations}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;
