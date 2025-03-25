
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface SeedPhraseProps {
  seedPhrase: string[];
  onRegenerateSeed: () => void;
  className?: string;
  privacyEnabled?: boolean;
}

const SeedPhrase: React.FC<SeedPhraseProps> = ({ 
  seedPhrase, 
  onRegenerateSeed,
  className,
  privacyEnabled = true
}) => {
  const [revealed, setRevealed] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Reset animation state when seed phrase changes
  useEffect(() => {
    setAnimationComplete(false);
    
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [seedPhrase]);

  // Reset revealed state when privacy setting changes
  useEffect(() => {
    if (privacyEnabled) {
      setRevealed(false);
    } else {
      setRevealed(true);
    }
  }, [privacyEnabled]);

  const handleReveal = () => {
    setRevealed(true);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium tracking-tight">Seed Phrase</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerateSeed}
          className="h-8 px-2 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Regenerate
        </Button>
      </div>
      
      <div className="relative">
        {(!revealed && privacyEnabled) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/80 backdrop-blur-sm rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Seed phrase is hidden for security
            </p>
            <Button 
              onClick={handleReveal} 
              variant="secondary"
              className="transition-all hover:shadow-md"
            >
              Reveal Seed Phrase
            </Button>
          </div>
        ) : null}
        
        <div className={cn(
          "grid grid-cols-3 gap-2 md:gap-3 p-4 bg-secondary/50 rounded-lg transition-all duration-500",
          (!revealed && privacyEnabled) && "blur-sm select-none"
        )}>
          {seedPhrase.map((word, index) => (
            <div 
              key={index}
              className={cn(
                "word-chip flex items-center",
                animationComplete && "animate-fade-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-muted-foreground mr-2 text-xs font-mono">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <span className="font-medium">{word}</span>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Keep your seed phrase secure. Never share it with anyone.
      </p>
    </div>
  );
};

export default SeedPhrase;
