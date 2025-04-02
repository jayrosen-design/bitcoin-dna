
import { useState, useCallback, useEffect } from 'react';
import { WalletEntry } from '@/components/WalletTable';
import { wordList } from '@/utils/wordList';
import { generateRandomTaprootAddress } from '@/utils/cryptoUtils';

export const useGetRandomWallets = (count = 50) => {
  const [randomWallets, setRandomWallets] = useState<WalletEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const generateRandomWallet = useCallback((): WalletEntry => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const address = generateRandomTaprootAddress();
    const balance = parseFloat((Math.random() * 0.1).toFixed(8));
    
    // Generate visual data (12 random indices from wordList)
    const visualData: number[] = [];
    for (let i = 0; i < 12; i++) {
      visualData.push(Math.floor(Math.random() * wordList.length));
    }
    
    return {
      id: `global-${Date.now()}-${Math.random()}`,
      address,
      balance,
      time: `${hours}:${minutes}`,
      date: `${month}/${day}`,
      source: 'global',
      visualData
    };
  }, []);
  
  const addWallet = useCallback((wallet: WalletEntry) => {
    setRandomWallets(prev => {
      const newWallets = [wallet, ...prev];
      return newWallets.slice(0, 200);  // Limit to 200 wallets
    });
  }, []);
  
  const addMockWallet = useCallback(() => {
    const newWallet = generateRandomWallet();
    addWallet(newWallet);
  }, [generateRandomWallet, addWallet]);
  
  // Generate initial wallets
  useEffect(() => {
    setIsLoading(true);
    const initialWallets: WalletEntry[] = [];
    
    for (let i = 0; i < count; i++) {
      initialWallets.push(generateRandomWallet());
    }
    
    setRandomWallets(initialWallets);
    setIsLoading(false);
    
    // Add a new wallet occasionally
    const timer = setInterval(() => {
      addMockWallet();
    }, 15000);
    
    return () => clearInterval(timer);
  }, [count, generateRandomWallet, addMockWallet]);
  
  return {
    randomWallets,
    isLoading,
    addWallet,
    addMockWallet
  };
};
