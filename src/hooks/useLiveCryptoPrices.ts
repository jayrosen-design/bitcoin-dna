
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { CryptoType } from '@/utils/walletUtils';

interface CryptoPriceResponse {
  bitcoin?: { usd: number };
  ethereum?: { usd: number };
}

interface RecentAddress {
  address: string;
  balance: string;
  txCount: number;
  lastActive: string;
}

// Cache to prevent duplicate API calls
const addressCache: Record<string, RecentAddress[]> = {
  bitcoin: [],
  ethereum: []
};

// Flag to track if initial data load has happened
let initialDataLoaded = false;

export const useLiveCryptoPrices = () => {
  const [btcPrice, setBtcPrice] = useState<number | null>(61432.50); // Default fallback price
  const [ethPrice, setEthPrice] = useState<number | null>(3389.75); // Default fallback price
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<{
    bitcoin: RecentAddress[],
    ethereum: RecentAddress[]
  }>({
    bitcoin: [],
    ethereum: []
  });
  const [initialized, setInitialized] = useState<boolean>(false);
  const apiCallsInProgress = useRef<number>(0);
  const lastApiCallTime = useRef<number>(Date.now());

  // Use predefined addresses to avoid API rate limiting
  const knownBitcoinAddresses = [
    '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', // Binance cold wallet
    '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', // Bitfinex cold wallet
    '3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a', // Coinbase
    '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP', // Kraken
    '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s'  // Huobi
  ];

  const fetchPrices = useCallback(async () => {
    // Don't make API calls if we already have too many in progress
    if (apiCallsInProgress.current > 2) {
      console.log('Too many API calls in progress, skipping price fetch');
      return;
    }
    
    // Rate limit API calls
    const now = Date.now();
    if (now - lastApiCallTime.current < 10000) { // 10 seconds
      console.log('API call rate limit reached, skipping price fetch');
      return;
    }
    
    lastApiCallTime.current = now;
    setIsLoading(true);
    setError(null);
    apiCallsInProgress.current++;
    
    try {
      // Using CoinGecko's public API (no API key required)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
        { signal: AbortSignal.timeout(5000) } // 5 second timeout
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency prices');
      }
      
      const data = await response.json() as CryptoPriceResponse;
      
      if (data.bitcoin?.usd) {
        setBtcPrice(data.bitcoin.usd);
      }
      
      if (data.ethereum?.usd) {
        setEthPrice(data.ethereum.usd);
      }
      
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Using fallback prices (already set in state)
      if (!initialized) {
        toast.info('Using estimated cryptocurrency prices');
      }
    } finally {
      setIsLoading(false);
      setInitialized(true);
      apiCallsInProgress.current--;
    }
  }, [initialized]);

  // Generate mock data for active Bitcoin addresses instead of making API calls
  const generateMockBitcoinAddresses = useCallback((): RecentAddress[] => {
    // If we already have cached addresses, return them
    if (addressCache.bitcoin.length > 0) {
      return addressCache.bitcoin;
    }
    
    const mockData = knownBitcoinAddresses.map(address => {
      // Generate deterministic but realistic data based on the address
      const addressHash = address.split('').reduce((a, b) => {
        return a + b.charCodeAt(0);
      }, 0);
      
      // Generate a balance between 0.1 and 10 BTC
      const balance = (0.1 + (addressHash % 990) / 100).toFixed(8);
      
      return {
        address,
        balance,
        txCount: Math.floor((addressHash % 500) + 100),
        lastActive: new Date().toISOString()
      };
    });
    
    // Cache the result
    addressCache.bitcoin = mockData;
    return mockData;
  }, []);

  // Mock data for Ethereum addresses
  const generateMockEthereumAddresses = useCallback((): RecentAddress[] => {
    // If we already have cached addresses, return them
    if (addressCache.ethereum.length > 0) {
      return addressCache.ethereum;
    }
    
    const ethAddresses = [
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH contract
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
      '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'  // Binance hot wallet
    ];
    
    const mockData = ethAddresses.map(address => {
      // Generate deterministic but realistic data based on the address
      const addressHash = address.split('').reduce((a, b) => {
        return a + b.charCodeAt(0);
      }, 0);
      
      // Generate a balance between 1 and 25 ETH
      const balance = (1 + (addressHash % 2400) / 100).toFixed(6);
      
      return {
        address,
        balance,
        txCount: Math.floor((addressHash % 200) + 50),
        lastActive: new Date().toISOString()
      };
    });
    
    // Cache the result
    addressCache.ethereum = mockData;
    return mockData;
  }, []);

  // Fetch recent active addresses - now uses mock data instead of making API calls
  const fetchRecentAddresses = useCallback(async () => {
    try {
      // For Bitcoin, use mock data instead of making API calls
      const btcAddressData = generateMockBitcoinAddresses();
      
      // For Ethereum, use mock data instead of making API calls
      const ethAddresses = generateMockEthereumAddresses();
      
      setRecentAddresses({
        bitcoin: btcAddressData,
        ethereum: ethAddresses
      });
    } catch (error) {
      console.error('Error generating recent addresses:', error);
    }
  }, [generateMockBitcoinAddresses, generateMockEthereumAddresses]);

  // Initialize data lazily when needed
  const initializeData = useCallback(() => {
    if (!initialDataLoaded) {
      initialDataLoaded = true;
      fetchRecentAddresses();
      
      // Delay price fetching to avoid overwhelming the app at startup
      setTimeout(() => {
        fetchPrices();
        
        // Set up a less frequent refresh interval (once per minute)
        const interval = setInterval(() => {
          fetchPrices();
        }, 60 * 1000); // 1 minute
        
        return () => clearInterval(interval);
      }, 2000); // Delay initial price fetch by 2 seconds
    }
  }, [fetchPrices, fetchRecentAddresses]);

  const getRandomActiveAddress = (cryptoType: CryptoType): string => {
    const addresses = cryptoType === 'bitcoin' 
      ? generateMockBitcoinAddresses() 
      : generateMockEthereumAddresses();
    
    if (addresses.length === 0) {
      // Fallback addresses if no recent ones are available
      return cryptoType === 'bitcoin' 
        ? '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ'
        : '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    }
    
    const randomIndex = Math.floor(Math.random() * addresses.length);
    return addresses[randomIndex].address;
  };

  return {
    btcPrice,
    ethPrice,
    isLoading,
    error,
    refetch: fetchPrices,
    getRandomActiveAddress,
    initialized,
    initializeData
  };
};
