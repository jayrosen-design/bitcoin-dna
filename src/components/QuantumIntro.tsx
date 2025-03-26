
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QuantumIntroProps {
  currentValue: number;
  btcValue?: number;
}

const QuantumIntro: React.FC<QuantumIntroProps> = ({ currentValue, btcValue = 0 }) => {
  const formatCurrency = (value: number) => {
    // Format billions
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    // Format millions
    else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    // Format thousands and smaller numbers
    else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    }
  };

  const formatBtc = (value: number) => {
    return `${value.toFixed(1)} BTC`;
  };

  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm border-primary/10">
      <CardContent className="pt-6 h-full">
        <div className="flex flex-col h-full">
          <div className="flex flex-col mb-6">
            <h2 className="text-2xl font-bold mb-3 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Quantum Crypto Keybreaker</h2>
            <p className="text-muted-foreground text-sm">
              Our advanced quantum computing algorithm exploits cryptographic vulnerabilities to crack wallet security. 
              Our system identifies and accesses dormant wallets containing significant cryptocurrency assets.
              Unlock access to these found seed phrases by staking your coin through our secure verification portal.
            </p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-12 w-full">
              <div className="text-center p-4 rounded-lg bg-secondary/30 backdrop-blur-sm w-full sm:w-auto">
                <div className="text-sm font-medium mb-2 text-muted-foreground">Total USD Value Unlocked</div>
                <div className="text-5xl font-bold text-bitcoin bg-gradient-to-r from-bitcoin to-bitcoin/70 bg-clip-text">{formatCurrency(currentValue)}</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-secondary/30 backdrop-blur-sm w-full sm:w-auto">
                <div className="text-sm font-medium mb-2 text-muted-foreground">Total BTC Unlocked</div>
                <div className="text-5xl font-bold text-bitcoin bg-gradient-to-r from-bitcoin to-bitcoin/70 bg-clip-text">{formatBtc(btcValue)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumIntro;
