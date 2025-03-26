
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const QuantumIntro: React.FC = () => {
  return (
    <Card className="mb-4 animate-fade-up">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
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
      </CardContent>
    </Card>
  );
};

export default QuantumIntro;
