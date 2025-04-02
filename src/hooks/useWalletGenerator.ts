
import { useState, useEffect, useCallback } from 'react';
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
  source: 'global' | 'user';
  time?: string;
  date?: string;
  visualData?: number[];
  transactions?: Array<{
    hash: string;
    amount: string;
    timestamp: string;
    type: 'incoming' | 'outgoing';
  }>;
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
  const [lastAutoTime, setLastAutoTime] = useState(0);
  
  useEffect(() => {
    generateNewSeedPhrase();
  }, []);
  
  // Fixed auto-generation with proper timer management
  useEffect(() => {
    let autoGenTimeout: NodeJS.Timeout | null = null;

    if (isAutoGenerating && !isLoading && !isGenerating) {
      const now = Date.now();
      
      // Make sure we're not generating too fast (at least 1s between generations)
      const delay = Math.max(0, lastAutoTime + 3000 - now);
      
      autoGenTimeout = setTimeout(() => {
        setLastAutoTime(Date.now());
        generateAndCheck();
        setAutoCount(prev => prev + 1);
        setTotalGenerations(prev => prev + 1);
      }, delay);
    }

    return () => {
      if (autoGenTimeout) clearTimeout(autoGenTimeout);
    };
  }, [isAutoGenerating, isLoading, isGenerating, autoCount, activeCrypto, lastAutoTime]);
  
  const generateNewSeedPhrase = useCallback(() => {
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
  }, [activeCrypto]);

  const checkWalletBalance = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setWalletStatus('checking');
    setTotalGenerations(prev => prev + 1);
    
    try {
      const result = await checkAddressBalance(activeCrypto, address);
      
      // Check if balance exists and is not too large (over 10 BTC)
      if (result.hasBalance && result.balance) {
        const balanceValue = parseFloat(result.balance);
        
        // Skip wallets with balance over 10 BTC
        if (balanceValue > 10) {
          console.log(`Skipping wallet with large balance: ${balanceValue} ${activeCrypto}`);
          setWalletStatus('no-balance');
          setWalletData({});
          setIsLoading(false);
          toast.info('Wallet with very large balance found and skipped');
          return;
        }
        
        setWalletStatus('has-balance');
        setWalletData({
          balance: result.balance,
          transactions: result.transactions
        });

        // Format timestamp for display
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

        const newWallet: WalletEntry = {
          id: Math.random().toString(36).substring(2, 9),
          seedPhrase: [...seedPhrase],
          address,
          balance: result.balance,
          timestamp: now,
          cryptoType: activeCrypto,
          source: 'user',
          time: timeStr,
          date: dateStr,
          transactions: result.transactions
        };
        setWalletHistory(prev => [...prev, newWallet]);
        
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
  }, [activeCrypto, address, isLoading, seedPhrase]);

  const generateAndCheck = useCallback(() => {
    generateNewSeedPhrase();
    
    setTimeout(() => {
      checkWalletBalance();
    }, 800);
  }, [generateNewSeedPhrase, checkWalletBalance]);

  const toggleAutoGeneration = useCallback(() => {
    const newState = !isAutoGenerating;
    setIsAutoGenerating(newState);
    
    if (newState) {
      toast.info('Auto-generation started - system will continuously generate and check new seed phrases');
      setLastAutoTime(Date.now());
    } else {
      toast.info(`Auto-generation stopped after ${autoCount} attempts`);
      setAutoCount(0);
    }
  }, [isAutoGenerating, autoCount]);
  
  const calculateMetrics = useCallback(() => {
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
  }, [walletHistory, totalGenerations, autoCount]);

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
