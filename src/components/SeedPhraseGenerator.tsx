
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader, RefreshCw, Play } from 'lucide-react';
import SeedPhrase from '@/components/SeedPhrase';

interface SeedPhraseGeneratorProps {
  seedPhrase: string[];
  onRegenerateSeed: () => void;
  onCheckWallet: () => void;
  onGenerateAndCheck: () => void;
  onToggleAutoGeneration: () => void;
  isLoading: boolean;
  isGenerating: boolean;
  isAutoGenerating: boolean;
  autoCount: number;
  privacyEnabled: boolean;
  isAccessLocked: boolean;
  onRequestUnlock: () => void;
}

const SeedPhraseGenerator: React.FC<SeedPhraseGeneratorProps> = ({
  seedPhrase,
  onRegenerateSeed,
  onCheckWallet,
  onGenerateAndCheck,
  onToggleAutoGeneration,
  isLoading,
  isGenerating,
  isAutoGenerating,
  autoCount,
  privacyEnabled,
  isAccessLocked,
  onRequestUnlock
}) => {
  return (
    <div className="flex flex-col space-y-6 h-full">
      <SeedPhrase
        seedPhrase={seedPhrase}
        onRegenerateSeed={onRegenerateSeed}
        className="animate-fade-up"
        privacyEnabled={privacyEnabled}
        isAccessLocked={isAccessLocked}
        onRequestUnlock={onRequestUnlock}
      />
      
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <Button
          onClick={onCheckWallet}
          disabled={isLoading || isGenerating || seedPhrase.length !== 12 || isAutoGenerating}
          className="w-full sm:flex-1"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Check Wallet'
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onGenerateAndCheck}
          disabled={isLoading || isGenerating || isAutoGenerating}
          className="w-full sm:flex-1"
          size="lg"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate & Check
        </Button>
        
        <Button
          variant={isAutoGenerating ? "destructive" : "secondary"}
          onClick={onToggleAutoGeneration}
          disabled={isLoading && !isAutoGenerating}
          className="w-full sm:flex-1"
          size="lg"
        >
          <Play className="mr-2 h-4 w-4" />
          {isAutoGenerating ? 'Stop Auto' : 'Auto Generate'}
          {isAutoGenerating && autoCount > 0 && ` (${autoCount})`}
        </Button>
      </div>
    </div>
  );
};

export default SeedPhraseGenerator;
