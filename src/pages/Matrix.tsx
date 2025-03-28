
import React from 'react';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import QuantumMatrixSimulation from '@/components/QuantumMatrixSimulation';
import { Card, CardContent } from '@/components/ui/card';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';

const Matrix = () => {
  const { btcPrice, isLoading } = useLiveCryptoPrices();
  const [isAccessUnlocked, setIsAccessUnlocked] = React.useState(false);
  
  const handleToggleUnlock = () => {
    setIsAccessUnlocked(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        activeCrypto="bitcoin"
        onCryptoChange={() => {}}
        isAccessUnlocked={isAccessUnlocked}
        onToggleUnlock={handleToggleUnlock}
        btcPrice={btcPrice}
        isPriceLoading={isLoading}
      />
      
      <main className="flex-1 container py-6">
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <h1 className="text-2xl font-bold mb-2 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
              Quantum Depth Seed Solver Simulation
            </h1>
            <p className="text-muted-foreground">
              Visualizing our quantum computing algorithm as it attempts to crack a 12-word Bitcoin 
              seed phrase from the 2048-word BIP-39 dictionary. The Rubik's cube represents 
              computational states, with a solved cube indicating a successful seed phrase discovery.
            </p>
          </CardContent>
        </Card>
        
        <div className="w-full aspect-[16/9] relative">
          <QuantumMatrixSimulation />
        </div>
      </main>
      
      <AppFooter 
        isAccessUnlocked={isAccessUnlocked}
        onToggleDeveloperAccess={handleToggleUnlock}
      />
    </div>
  );
};

export default Matrix;
