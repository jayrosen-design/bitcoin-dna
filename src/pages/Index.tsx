import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  generateSeedPhrase, 
  deriveAddress, 
  checkAddressBalance,
  formatCrypto,
  getExplorerUrl,
  CryptoType
} from '@/utils/walletUtils';
import SeedPhrase from '@/components/SeedPhrase';
import WalletVisualizer from '@/components/WalletVisualizer';
import WalletDashboard from '@/components/WalletDashboard';
import WalletTable, { WalletEntry } from '@/components/WalletTable';
import { Loader, Play, RefreshCw, Eye, EyeOff, Bitcoin, Coins } from 'lucide-react';
import CryptoNavigation from '@/components/CryptoNavigation';

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
  const [activeCrypto, setActiveCrypto] = useState<CryptoType>('bitcoin');

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
  }, [isAutoGenerating, isLoading, isGenerating, autoCount, activeCrypto]);

  const handleCryptoChange = (crypto: CryptoType) => {
    if (crypto !== activeCrypto) {
      setActiveCrypto(crypto);
      setWalletStatus('idle');
      setWalletData({});
      generateNewSeedPhrase();
      toast.success(`Switched to ${crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} wallet`);
    }
  };

  const generateNewSeedPhrase = () => {
    setIsGenerating(true);
    setWalletStatus('idle');
    setWalletData({});
    
    setTimeout(() => {
      const newSeedPhrase = generateSeedPhrase();
      setSeedPhrase(newSeedPhrase);
      const newAddress = deriveAddress(newSeedPhrase, activeCrypto);
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
      const result = await checkAddressBalance(address, activeCrypto);
      
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
            timestamp: new Date(),
            cryptoType: activeCrypto
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
            <WalletVisualizer status={walletStatus} address={address} cryptoType={activeCrypto} />
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
            cryptoType={activeCrypto}
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
          <div className="animate-fade-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-xl font-semibold mb-4">Generated Wallets History</h2>
            <WalletTable 
              wallets={walletHistory} 
              emptyMessage="This table will store generated wallets. Click Generate or Auto Generate to begin." 
            />
          </div>
        </div>
      </div>
    );
  };

  const getCryptoIcon = () => {
    return activeCrypto === 'bitcoin' ? 
      <Bitcoin className="text-bitcoin" /> : 
      <Coins className="text-ethereum" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b py-4 px-4 md:px-6 w-full bg-background/95 backdrop-blur-sm fixed top-0 z-10">
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getCryptoIcon()}
            <h1 className="text-xl font-medium tracking-tight">
              {activeCrypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} Wallet
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <CryptoNavigation 
              activeCrypto={activeCrypto} 
              onCryptoChange={handleCryptoChange}
            />
            
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
            <div className="inline-block px-3 py-1 bg-accent/20 text-xs font-medium rounded-full mb-3">
              {activeCrypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} Seed Phrase Generator & Wallet Simulator
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Generate a {activeCrypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} Seed Phrase
            </h2>
            <p className="text-muted-foreground mx-auto text-balance max-w-2xl">
              Create a random 12-word seed phrase and check if the derived {activeCrypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} wallet contains funds.
            </p>
          </div>
          
          {renderContent()}
        </div>
      </main>
      
      <footer className="py-4 px-4 border-t w-full">
        <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs">
          <p className="text-muted-foreground">
            {activeCrypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} Wallet - For educational purposes only
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
