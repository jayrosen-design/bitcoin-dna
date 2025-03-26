
import React, { useEffect, useState } from 'react';
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

const StatusCards: React.FC<StatusCardsProps> = ({ totalValueUnlocked: initialValues, metrics }) => {
  const [totalValueUnlocked, setTotalValueUnlocked] = useState(initialValues);
  
  useEffect(() => {
    // Update initial values when they change from props
    setTotalValueUnlocked(initialValues);
  }, [initialValues]);
  
  useEffect(() => {
    // Auto-increment wallet count every 3-5 seconds
    const walletInterval = setInterval(() => {
      const randomWalletIncrement = Math.floor(Math.random() * 2) + 1; // 1 or 2
      const randomBtcIncrement = (Math.random() * 1.925 + 0.2).toFixed(8); // Between 0.2 and 2.125
      const btcValue = parseFloat(randomBtcIncrement);
      
      setTotalValueUnlocked(prev => ({
        ...prev,
        wallets: prev.wallets + randomWalletIncrement,
        btc: prev.btc + btcValue,
        usd: (prev.btc + btcValue) * (prev.usd / prev.btc) // Maintain the same BTC/USD ratio
      }));
    }, Math.floor(Math.random() * 2000) + 3000); // Between 3000ms and 5000ms
    
    return () => clearInterval(walletInterval);
  }, []);

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
