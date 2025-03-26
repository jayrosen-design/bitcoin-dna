
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  generateSeedPhrase, 
  deriveAddress, 
  checkAddressBalance,
  CryptoType
} from '@/utils/walletUtils';

export interface WalletEntry {
  id: string;
  seedPhrase: string[];
  address: string;
  balance: string;
  timestamp: Date;
  cryptoType: CryptoType;
}

export const useWalletGenerator = (activeCrypto: CryptoType) => {
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
  const [totalGenerations, setTotalGenerations] = useState(0);
  
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
  
  const generateNewSeedPhrase = () => {
    setIsGenerating(true);
    setWalletStatus('idle');
    setWalletData({});
    
    setTimeout(() => {
      const newSeedPhrase = generateSeedPhrase();
      setSeedPhrase(newSeedPhrase);
      
      deriveAddress(newSeedPhrase, activeCrypto)
        .then(newAddress => {
          setAddress(newAddress);
          setIsGenerating(false);
          toast.success('New seed phrase generated');
        })
        .catch(error => {
          console.error('Error deriving address:', error);
          setIsGenerating(false);
          toast.error('Error generating address');
        });
    }, 500);
  };

  const checkWalletBalance = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setWalletStatus('checking');
    setTotalGenerations(prev => prev + 1);
    
    try {
      const result = await checkAddressBalance(activeCrypto, address);
      
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
      totalBTC,
      totalETH,
      totalWallets: walletHistory.length,
      bitcoinWallets: bitcoinWallets.length,
      ethereumWallets: ethereumWallets.length,
      successRate,
      totalGenerations,
      autoCount
    };
  };

  return {
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
  };
};
