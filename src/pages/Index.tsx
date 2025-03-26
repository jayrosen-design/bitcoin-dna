import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import UnlockModal from '@/components/UnlockModal';
import WalletDashboard from '@/components/WalletDashboard';
import WalletTable from '@/components/WalletTable';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';
import { CryptoType } from '@/utils/walletUtils';
import { useWalletGenerator, WalletEntry } from '@/hooks/useWalletGenerator';
import StatusCards from '@/components/StatusCards';
import SeedPhraseGenerator from '@/components/SeedPhraseGenerator';
import GenerationSummary from '@/components/GenerationSummary';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import QuantumIntro from '@/components/QuantumIntro';

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
    btc: 431, 
    usd: 0, 
    wallets: 679,
    totalSeedPhrases: 48931056202590
  });
  
  const { btcPrice, ethPrice, isLoading: isPriceLoading } = useLiveCryptoPrices();
  
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
    const seedPhrasesInterval = setInterval(() => {
      const randomIncrement = Math.floor(Math.random() * 5) + 1;
      setTotalValueUnlocked(prev => ({
        ...prev,
        totalSeedPhrases: prev.totalSeedPhrases + randomIncrement
      }));
    }, 1000);

    return () => clearInterval(seedPhrasesInterval);
  }, []);

  useEffect(() => {
    if (btcPrice) {
      const timestampInSatoshis = Date.now() % 10000000;
      const timestampInBTC = timestampInSatoshis / 100000000000;
      const totalBTC = 431 + timestampInBTC;
      
      setTotalValueUnlocked(prev => ({
        ...prev,
        btc: totalBTC,
        usd: totalBTC * btcPrice
      }));
    }
  }, [btcPrice]);
  
  useEffect(() => {
    if (walletData.balance && activeCrypto === 'bitcoin') {
      const foundBalance = parseFloat(walletData.balance) || 0;
      setTotalValueUnlocked(prev => {
        const newBtcTotal = prev.btc + foundBalance;
        return {
          btc: newBtcTotal,
          usd: newBtcTotal * (btcPrice || 0),
          wallets: prev.wallets + 1,
          totalSeedPhrases: prev.totalSeedPhrases
        };
      });
    }
  }, [walletData.balance, activeCrypto, btcPrice]);

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
            <QuantumIntro />
            
            <div className="animate-fade-up">
              <StatusCards
                totalValueUnlocked={totalValueUnlocked}
                metrics={walletMetrics}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-6 h-full">
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
            
            <GenerationSummary
              metrics={summaryMetrics}
              walletStatus={walletStatus}
              address={address}
              cryptoType={activeCrypto}
            />
          </div>
        </div>
        
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
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader 
        activeCrypto={activeCrypto}
        onCryptoChange={handleCryptoChange}
        isAccessUnlocked={isAccessUnlocked}
        onToggleUnlock={toggleUnlockModal}
        btcPrice={btcPrice}
        isPriceLoading={isPriceLoading}
      />
      
      <main className="flex-1 pt-10 pb-8 px-3 sm:px-4">
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
