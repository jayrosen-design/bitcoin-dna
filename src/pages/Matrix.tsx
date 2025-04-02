
import React from 'react';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { Card, CardContent } from '@/components/ui/card';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';
import { QuantumSeedSimulation } from '@/components/quantum-simulation/QuantumSeedSimulation';

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
      
      <main className="flex-1 container py-4 flex flex-col">
        <Card className="glass-card mb-4">
          <CardContent className="p-4">
            <h1 className="text-2xl font-bold mb-2 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
              Quantum Seed Phrase Guesser Simulation
            </h1>
            <p className="text-muted-foreground">
              Visualizing quantum attempts to discover Bitcoin seed phrases from the 2048-word BIP-39 dictionary.
              Each attempt generates a random 12-word combination, simulating the quantum computing process.
            </p>
          </CardContent>
        </Card>
        
        <div className="flex-1 h-[calc(100vh-280px)] min-h-[500px] overflow-hidden border border-gray-700 rounded-md bg-[#0a0a0a]">
          <QuantumSeedSimulation />
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
