
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface BitcoinDnaIntroProps {
  currentValue: number;
  btcValue?: number;
}

const BitcoinDnaIntro: React.FC<BitcoinDnaIntroProps> = ({ currentValue, btcValue = 0 }) => {
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

  // Ensure we always have a valid number for display
  const displayValue = isNaN(currentValue) || currentValue < 0 ? 0 : currentValue;

  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm border-primary/10">
      <CardContent className="pt-6 h-full">
        <div className="flex flex-col h-full">
          <div className="flex flex-col mb-6">
            <h2 className="text-2xl font-bold mb-3 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Bitcoin DNA Visualization</h2>
            <p className="text-muted-foreground text-sm">
              Each Bitcoin seed phrase creates a unique DNA animation. The patterns are deterministically generated from the cryptographic properties of the wallet. 
              SHA-256 and SHA-512 hashing algorithms create deterministic patterns unique to your keys. 
              The hash values control DNA helix properties, creating visual patterns that are unique to your wallet.
            </p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 bg-secondary/20 p-2 rounded-sm">
              <Info size={14} />
              <span>This application visualizes the cryptographic properties of Bitcoin wallets through DNA-inspired animations.</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-12 w-full">
              <div className="text-center p-4 rounded-lg bg-secondary/30 backdrop-blur-sm w-full sm:w-auto">
                <div className="text-sm font-medium mb-2 text-muted-foreground">Total USD Value Visualized</div>
                <div className="text-5xl font-bold text-bitcoin bg-gradient-to-r from-bitcoin to-bitcoin/70 bg-clip-text">{formatCurrency(displayValue)}</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-secondary/30 backdrop-blur-sm w-full sm:w-auto">
                <div className="text-sm font-medium mb-2 text-muted-foreground">Total BTC Visualized</div>
                <div className="text-5xl font-bold text-bitcoin bg-gradient-to-r from-bitcoin to-bitcoin/70 bg-clip-text">{formatBtc(btcValue)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BitcoinDnaIntro;
