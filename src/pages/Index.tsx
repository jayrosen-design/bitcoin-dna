import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { toast } from 'sonner';
import { 
  generateSeedPhrase, 
  deriveAddress, 
  checkAddressBalance,
  formatBitcoin
} from '@/utils/walletUtils';
import SeedPhrase from '@/components/SeedPhrase';
import WalletVisualizer from '@/components/WalletVisualizer';
import WalletDashboard from '@/components/WalletDashboard';
import WalletTable, { WalletEntry } from '@/components/WalletTable';
import { Loader, Play, RefreshCw, Eye, EyeOff } from 'lucide-react';

const Index = () => {
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [address, setAddress] = useState<string>('');
  const [walletStatus, setWalletStatus] = useState<
    'idle' | 'checking' | 'no-balance' | 'has-balance' | 'unlocking' | 'unlocked'
  >('idle');
  const [walletData, setWalletData] = useState<{
    balance?: string;
    transactions?: Array<{
      hash: string;
      amount: string;
      timestamp: string;
      type: 'incoming' | 'outgoing';
    }>;
  }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletHistory, setWalletHistory] = useState<WalletEntry[]>([]);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [privacyEnabled, setPrivacyEnabled] = useState(true);

  useEffect(() => {
    generateNewSeedPhrase();
  }, []);

  useEffect(() => {
    let autoGenInterval: NodeJS.Timeout;

    if (isAutoGenerating && !isLoading && !isGenerating) {
      autoGenInterval = setTimeout(() => {
        generateAndCheck();
        setAutoCount(prev => prev + 1);
      }, 3000);
    }

    return () => {
      if (autoGenInterval) clearTimeout(autoGenInterval);
    };
  }, [isAutoGenerating, isLoading, isGenerating, autoCount]);

  const generateNewSeedPhrase = () => {
    setIsGenerating(true);
    setWalletStatus('idle');
    setWalletData({});
    
    setTimeout(() => {
      const newSeedPhrase = generateSeedPhrase();
      setSeedPhrase(newSeedPhrase);
      const newAddress = deriveAddress(newSeedPhrase);
      setAddress(newAddress);
      setIsGenerating(false);
      
      toast.success('New seed phrase generated');
    }, 500);
  };

  const checkWalletBalance = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setWalletStatus('checking');
    
    try {
      const result = await checkAddressBalance(address);
      
      if (result.hasBalance) {
        setWalletStatus('has-balance');
        setWalletData({
          balance: result.balance,
          transactions: result.transactions
        });

        if (result.balance) {
          const newWallet: WalletEntry = {
            id: Math.random().toString(36).substring(2, 9),
            seedPhrase: [...seedPhrase],
            address,
            balance: result.balance,
            timestamp: new Date()
          };
          setWalletHistory(prev => [...prev, newWallet]);
        }
        
        setTimeout(() => {
          setWalletStatus('unlocking');
          
          setTimeout(() => {
            setWalletStatus('unlocked');
          }, 2000);
        }, 1500);
      } else {
        setWalletStatus('no-balance');
        setWalletData({});
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
      toast.error('Failed to check wallet balance');
      setWalletStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndCheck = () => {
    generateNewSeedPhrase();
    
    setTimeout(() => {
      checkWalletBalance();
    }, 800);
  };

  const toggleAutoGeneration = () => {
    if (isAutoGenerating) {
      toast.info(`Auto-generation stopped after ${autoCount} attempts`);
      setAutoCount(0);
    } else {
      toast.info('Auto-generation started - system will continuously generate and check new seed phrases');
    }
    setIsAutoGenerating(!isAutoGenerating);
  };

  const togglePrivacy = () => {
    setPrivacyEnabled(!privacyEnabled);
    toast.info(privacyEnabled ? 'Seed phrase visible' : 'Seed phrase hidden');
  };

  const renderSeedPhraseColumn = () => {
    return (
      <div className="flex flex-col space-y-6 h-full">
        <SeedPhrase
          seedPhrase={seedPhrase}
          onRegenerateSeed={generateNewSeedPhrase}
          className="animate-fade-up"
          privacyEnabled={privacyEnabled && !isAutoGenerating}
        />
        
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Button
            onClick={checkWalletBalance}
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
            onClick={generateAndCheck}
            disabled={isLoading || isGenerating || isAutoGenerating}
            className="w-full sm:flex-1"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate & Check
          </Button>
          
          <Button
            variant={isAutoGenerating ? "destructive" : "secondary"}
            onClick={toggleAutoGeneration}
            disabled={isLoading && !isAutoGenerating}
            className="w-full sm:flex-1"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            {isAutoGenerating ? 'Stop Auto' : 'Auto Generate'}
            {isAutoGenerating && autoCount > 0 && ` (${autoCount})`}
          </Button>
        </div>
        
        {walletStatus !== 'idle' && (
          <div className="mt-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <WalletVisualizer status={walletStatus} address={address} />
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (walletStatus === 'unlocked' && walletData.balance) {
      return (
        <div className="animate-fade-up space-y-8 w-full">
          <WalletDashboard
            address={address}
            balance={walletData.balance}
            transactions={walletData.transactions || []}
          />
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div>
          {renderSeedPhraseColumn()}
        </div>
        
        <div>
          {walletHistory.length > 0 && (
            <div className="animate-fade-up" style={{ animationDelay: '500ms' }}>
              <h2 className="text-xl font-semibold mb-4">Generated Wallets History</h2>
              <WalletTable wallets={walletHistory} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b py-4 px-4 md:px-6 w-full bg-background/95 backdrop-blur-sm fixed top-0 z-10">
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none"
              className="text-bitcoin"
            >
              <path
                d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.954 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.415-.614.322.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.54 2.143 1.32.33.54-2.18c2.24.427 3.93.255 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.185 3.137.53 2.75 2.084l.002.006z"
                fill="currentColor"
              />
            </svg>
            <h1 className="text-xl font-medium tracking-tight">Bitcoin Wallet</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isAutoGenerating && (
              <div className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                <Loader className="h-3 w-3 mr-1 animate-spin" /> 
                Auto-generating... {autoCount}
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={togglePrivacy}
              className="text-sm"
            >
              {privacyEnabled ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show Seed
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide Seed
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 pt-20 pb-8 px-3 sm:px-4">
        <div className="w-full">
          <div className="mb-8 text-center">
            <div className="inline-block px-3 py-1 bg-bitcoin/10 text-xs font-medium rounded-full mb-3">
              Bitcoin Seed Phrase Generator & Wallet Simulator
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Generate a Bitcoin Seed Phrase
            </h2>
            <p className="text-muted-foreground mx-auto text-balance max-w-2xl">
              Create a random 12-word seed phrase and check if the derived Bitcoin wallet contains funds.
            </p>
          </div>
          
          {renderContent()}
        </div>
      </main>
      
      <footer className="py-4 px-4 border-t w-full">
        <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs">
          <p className="text-muted-foreground">
            Bitcoin Wallet - For educational purposes only
          </p>
          <div className="text-muted-foreground">
            <span>Built with precision and care</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
