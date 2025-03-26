
import React, { useEffect, useState, useRef } from 'react';
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
  const autoIncrementTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Only update specific values from props
    setTotalValueUnlocked(prev => ({
      ...prev,
      totalSeedPhrases: initialValues.totalSeedPhrases,
    }));
  }, [initialValues.totalSeedPhrases]);
  
  useEffect(() => {
    // Start auto-incrementing at a more reasonable rate
    startAutoIncrementingValues();
    
    return () => {
      if (autoIncrementTimerRef.current) {
        clearTimeout(autoIncrementTimerRef.current);
      }
    };
  }, []);

  const startAutoIncrementingValues = () => {
    const scheduleNextIncrement = () => {
      // Random delay between 5-10 seconds
      const delay = Math.floor(Math.random() * 5000) + 5000;
      
      autoIncrementTimerRef.current = setTimeout(() => {
        setTotalValueUnlocked(prev => {
          // More realistic increments
          const randomWalletIncrement = Math.random() < 0.7 ? 1 : 0; // 70% chance of adding 1 wallet
          const randomBtcIncrement = Math.random() < 0.7 ? 
            (Math.random() * 0.01 + 0.0001).toFixed(8) : // Small amount most of the time
            "0";
          const btcValue = parseFloat(randomBtcIncrement);
          
          const newBtc = prev.btc + btcValue;
          const newUsd = newBtc * (prev.usd / prev.btc); // Maintain the same BTC/USD ratio
          
          return {
            ...prev,
            wallets: prev.wallets + randomWalletIncrement,
            btc: newBtc,
            usd: newUsd
          };
        });
        
        scheduleNextIncrement();
      }, delay);
    };
    
    scheduleNextIncrement();
  };

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
              <span className="font-medium">{totalValueUnlocked.wallets.toLocaleString()}</span>
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
