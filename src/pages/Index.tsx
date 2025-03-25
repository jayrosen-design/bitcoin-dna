
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
import { Loader, Play, RefreshCw, Lock, Unlock, Bitcoin, Coins } from 'lucide-react';
import CryptoNavigation from '@/components/CryptoNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';
import UnlockModal from '@/components/UnlockModal';
import { Switch } from '@/components/ui/switch';
import ThemeToggle from '@/components/ThemeToggle';

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
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isAccessUnlocked, setIsAccessUnlocked] = useState(false);
  
  const { btcPrice, ethPrice, isLoading: isPriceLoading } = useLiveCryptoPrices();

  useEffect(() => {
    generateNewSeedPhrase();
  }, []);

  useEffect(() => {
    let autoGenInterval: NodeJS.Timeout;

    if (isAutoGenerating && !isLoading && !isGenerating) {
      autoGenInterval = setTimeout(() => {
        generateAndCheck();
        setAutoCount(prev => prev + 1);
        setTotalGenerations(prev => prev + 1);
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
    setTotalGenerations(prev => prev + 1);
    
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

  const toggleUnlockModal = () => {
    if (!isAccessUnlocked) {
      setIsUnlockModalOpen(true);
    } else {
      togglePrivacy();
    }
  };

  const togglePrivacy = () => {
    setPrivacyEnabled(!privacyEnabled);
    toast.info(privacyEnabled ? 'Seed phrase visible' : 'Seed phrase hidden');
  };

  const handleUnlock = () => {
    setIsAccessUnlocked(true);
    setPrivacyEnabled(false);
  };

  const toggleDeveloperAccess = () => {
    setIsAccessUnlocked(!isAccessUnlocked);
    toast.info(isAccessUnlocked ? 'Developer mode: Access locked' : 'Developer mode: Access unlocked');
    if (!isAccessUnlocked) {
      setPrivacyEnabled(false);
    }
  };

  const renderSeedPhraseColumn = () => {
    return (
      <div className="flex flex-col space-y-6 h-full">
        <div className="text-center mb-4">
          <div className="inline-block px-3 py-1 bg-accent/20 text-xs font-medium rounded-full mb-3">
            Quantum Crypto Keybreaker
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {activeCrypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} Quantum Breach Protocol
          </h2>
          <p className="text-muted-foreground text-balance">
            Use advanced quantum simulation to find existing {activeCrypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} wallets and access their stored funds.
          </p>
        </div>
      
        <SeedPhrase
          seedPhrase={seedPhrase}
          onRegenerateSeed={generateNewSeedPhrase}
          className="animate-fade-up"
          privacyEnabled={privacyEnabled}
          isAccessLocked={!isAccessUnlocked}
          onRequestUnlock={() => setIsUnlockModalOpen(true)}
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

  const calculateMetrics = () => {
    const bitcoinWallets = walletHistory.filter(w => w.cryptoType === 'bitcoin');
    const ethereumWallets = walletHistory.filter(w => w.cryptoType === 'ethereum');
    
    const totalBTC = bitcoinWallets.reduce((total, wallet) => {
      const amount = parseFloat(wallet.balance) || 0;
      return total + amount;
    }, 0);
    
    const totalETH = ethereumWallets.reduce((total, wallet) => {
      const amount = parseFloat(wallet.balance) || 0;
      return total + amount;
    }, 0);
    
    const successRate = totalGenerations > 0 
      ? ((bitcoinWallets.length + ethereumWallets.length) / totalGenerations * 100)
      : 0;
    
    return {
      btcPrice: btcPrice || 0,
      ethPrice: ethPrice || 0,
      totalBTC,
      totalETH,
      btcValue: totalBTC * (btcPrice || 0),
      ethValue: totalETH * (ethPrice || 0),
      totalWallets: walletHistory.length,
      bitcoinWallets: bitcoinWallets.length,
      ethereumWallets: ethereumWallets.length,
      successRate,
      totalGenerations
    };
  };

  const renderMetricsArea = () => {
    const metrics = calculateMetrics();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-up">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bitcoin className="h-5 w-5 text-bitcoin mr-2" />
              Bitcoin Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-medium">
                  {isPriceLoading ? (
                    <Loader className="h-3 w-3 animate-spin inline mr-1" />
                  ) : (
                    `$${metrics.btcPrice.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">BTC Found:</span>
                <span className="font-medium">{metrics.totalBTC.toFixed(8)} BTC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">USD Value:</span>
                <span className="font-medium">${metrics.btcValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Wallets Generated:</span>
                <span className="font-medium">{metrics.bitcoinWallets}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Coins className="h-5 w-5 text-ethereum mr-2" />
              Ethereum Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-medium">
                  {isPriceLoading ? (
                    <Loader className="h-3 w-3 animate-spin inline mr-1" />
                  ) : (
                    `$${metrics.ethPrice.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ETH Found:</span>
                <span className="font-medium">{metrics.totalETH.toFixed(8)} ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">USD Value:</span>
                <span className="font-medium">${metrics.ethValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Wallets Generated:</span>
                <span className="font-medium">{metrics.ethereumWallets}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Generation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-muted-foreground">Total Wallets Generated:</span>
                <span className="font-semibold text-xl ml-2">{metrics.totalWallets}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Auto Generations:</span>
                <span className="font-semibold text-xl ml-2">{autoCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-semibold text-xl ml-2">
                  {metrics.successRate.toFixed(2)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({metrics.totalWallets}/{metrics.totalGenerations})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
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
        
        <div className="space-y-8">
          {renderMetricsArea()}
          
          <div className="animate-fade-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-xl font-semibold mb-4">Generated Wallets History</h2>
            <WalletTable 
              wallets={walletHistory} 
              emptyMessage="This table will store generated wallets. Click Generate or Auto Generate to begin."
              isAccessLocked={!isAccessUnlocked}
              onRequestUnlock={() => setIsUnlockModalOpen(true)}
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
              Quantum Crypto Keybreaker
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <CryptoNavigation 
              activeCrypto={activeCrypto} 
              onCryptoChange={handleCryptoChange}
            />
            
            {isAutoGenerating && (
              <div className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-full flex items-center">
                <Loader className="h-3 w-3 mr-1 animate-spin" /> 
                Auto-generating... {autoCount}
              </div>
            )}
            
            <ThemeToggle />
            
            <Button 
              variant="outline" 
              onClick={toggleUnlockModal}
              className="text-sm"
            >
              {isAccessUnlocked ? (
                <>
                  <Unlock className="h-4 w-4 mr-1" />
                  Seed Unlocked
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-1" />
                  Unlock Seed
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 pt-20 pb-8 px-3 sm:px-4">
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
      
      <footer className="py-4 px-4 border-t w-full">
        <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs">
          <p className="text-muted-foreground">
            Quantum Crypto Keybreaker - For educational purposes only
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Developer Mode:</span>
              <div className="flex items-center space-x-2">
                <Switch
                  id="developer-mode"
                  checked={isAccessUnlocked}
                  onCheckedChange={toggleDeveloperAccess}
                />
                <span className="text-xs font-medium">
                  {isAccessUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
            <div className="text-muted-foreground">
              <span>Built with precision and care</span>
            </div>
          </div>
        </div>
      </footer>
      
      <UnlockModal 
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlock={handleUnlock}
        activeCrypto={activeCrypto}
      />
    </div>
  );
};

export default Index;
