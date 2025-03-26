
import { useState, useEffect, useRef } from 'react';
import { WalletEntry } from './useWalletGenerator';
import { CryptoType } from '@/utils/walletUtils';
import { wordList } from '@/utils/wordList';

// Famous Bitcoin addresses to fetch real data from
const FAMOUS_ADDRESSES = [
  '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s', // Satoshi address
  '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP', // MtGox address
  '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', // Binance Cold Wallet
  '3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a', // Coinbase address
  '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', // Bitfinex address
];

// Function to generate mock wallet entries with balance limit
const generateMockWallets = (count: number): WalletEntry[] => {
  const mockWallets: WalletEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a mock Bitcoin address
    const address = '1' + Array(33).fill(0).map(() => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    
    // Generate a BTC balance between 0.0001 and 10 BTC (capped)
    const balance = (Math.random() * 9.9999 + 0.0001).toFixed(8);
    
    // Generate a timestamp within the last 30 days
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
    
    // Generate a seed phrase using 12 random words from wordList
    const seedPhrase = Array(12).fill('').map(() => 
      wordList[Math.floor(Math.random() * wordList.length)]
    );
    
    mockWallets.push({
      id: `mock-${i}-${Math.random().toString(36).substring(2, 9)}`,
      seedPhrase: seedPhrase,
      address: address,
      balance: balance,
      timestamp: timestamp,
      cryptoType: 'bitcoin',
      source: 'global'
    });
  }
  
  return mockWallets;
};

export const useGetRandomWallets = (initialMockCount: number = 100) => {
  const [randomWallets, setRandomWallets] = useState<WalletEntry[]>(generateMockWallets(initialMockCount));
  const [isLoading, setIsLoading] = useState(false);
  const autoAddTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start auto-adding wallets at a reasonable rate
    startAutoAddingWallets();

    return () => {
      if (autoAddTimerRef.current) {
        clearTimeout(autoAddTimerRef.current);
      }
    };
  }, []);

  const startAutoAddingWallets = () => {
    const scheduleNextAddition = () => {
      // Random delay between 1-3 seconds
      const delay = Math.floor(Math.random() * 2000) + 1000;
      
      autoAddTimerRef.current = setTimeout(() => {
        addMockWallet();
        scheduleNextAddition();
      }, delay);
    };
    
    scheduleNextAddition();
  };

  // Function to add a new wallet to the random wallets list
  const addWallet = (wallet: WalletEntry) => {
    // Skip wallets with balance over 10 BTC
    if (parseFloat(wallet.balance) > 10) {
      console.log(`Skipping global wallet with large balance: ${wallet.balance} ${wallet.cryptoType}`);
      return;
    }
    
    setRandomWallets(prev => {
      // Check if wallet with the same ID already exists to avoid duplicates
      if (prev.some(w => w.id === wallet.id)) {
        return prev;
      }
      
      // Add source property if not already set
      const walletWithSource = {
        ...wallet,
        source: wallet.source || 'user'
      };
      
      // Keep list at a reasonable size (cap at 200 entries)
      const newList = [walletWithSource, ...prev];
      if (newList.length > 200) {
        return newList.slice(0, 200);
      }
      return newList;
    });
  };

  // Function to add a mock wallet (for automatic additions)
  const addMockWallet = () => {
    const mockWallet = generateMockWallets(1)[0];
    addWallet(mockWallet);
    return mockWallet;
  };

  return { 
    randomWallets, 
    isLoading, 
    addWallet, 
    addMockWallet
  };
};
