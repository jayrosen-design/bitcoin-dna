
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';

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
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Quantum Crypto Keybreaker</h2>
              <p className="text-muted-foreground">
                Our advanced quantum algorithm scans the blockchain for vulnerable wallets and seed phrases. 
                Generate, scan, and unlock Bitcoin wallets with our cutting-edge technology. 
                Monitor real-time statistics of unlocked wallets and digital assets recovered by our system.
              </p>
            </div>
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
