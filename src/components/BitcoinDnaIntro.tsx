
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface BitcoinDnaIntroProps {
  currentValue: number;
  btcValue?: number;
}

const BitcoinDnaIntro: React.FC<BitcoinDnaIntroProps> = ({ currentValue, btcValue = 0 }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold mb-3 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Bitcoin DNA Visualization</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Each Bitcoin seed phrase creates a unique DNA animation. The patterns are deterministically generated from the cryptographic properties of the wallet. 
        </p>
        
        <p className="text-muted-foreground text-sm mb-4">
          SHA-256 and SHA-512 hashing algorithms create deterministic patterns unique to your keys. 
          The hash values control DNA helix properties, creating visual patterns that are unique to your wallet.
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 bg-secondary/20 p-2 rounded-sm">
          <Info size={14} />
          <span>This application visualizes the cryptographic properties of Bitcoin wallets through DNA-inspired animations.</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="text-sm text-muted-foreground list-decimal ml-5 space-y-2">
          <li>Your Bitcoin wallet's seed phrase is processed securely</li>
          <li>Cryptographic hashing algorithms create deterministic patterns</li>
          <li>The resulting data controls the DNA helix visualization properties</li>
          <li>Each wallet creates a unique visual fingerprint</li>
        </ol>
      </div>
    </div>
  );
};

export default BitcoinDnaIntro;
