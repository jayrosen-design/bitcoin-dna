
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QuantumIntroProps {
  currentValue: number;
}

const QuantumIntro: React.FC<QuantumIntroProps> = ({ currentValue }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="animate-fade-up h-full">
      <CardContent className="pt-6 h-full">
        <div className="flex flex-col h-full">
          <div className="flex flex-col mb-4">
            <h2 className="text-xl font-semibold mb-2">Quantum Crypto Keybreaker</h2>
            <p className="text-muted-foreground">
              Our advanced quantum computing algorithm exploits cryptographic vulnerabilities to crack wallet security. 
              Our system identifies and accesses dormant wallets containing significant cryptocurrency assets.
              Unlock access to these found seed phrases by staking your coin through our secure verification portal.
            </p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="text-center">
              <div className="text-sm font-medium mb-1 text-muted-foreground">Total USD Value Unlocked</div>
              <div className="text-5xl font-bold text-primary">{formatCurrency(currentValue)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumIntro;
