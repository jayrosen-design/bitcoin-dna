
import { useState, useEffect, useCallback } from 'react';
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

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
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
    }
  }, [initialized]);

  // Fetch active Bitcoin addresses - simplified to reduce API calls
  const fetchActiveBitcoinAddresses = useCallback(async (): Promise<RecentAddress[]> => {
    try {
      // These are known active Bitcoin addresses with transactions
      const knownAddresses = [
        '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', // Binance cold wallet
        '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', // Bitfinex cold wallet
        '3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a', // Coinbase
        '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP', // Kraken
        '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s'  // Huobi
      ];
      
      // Return mocked data to avoid API rate limits
      return knownAddresses.map(address => ({
        address,
        balance: (Math.random() * 100).toFixed(8),
        txCount: Math.floor(Math.random() * 1000) + 100,
        lastActive: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error generating active Bitcoin addresses:', error);
      return [];
    }
  }, []);

  // Fetch recent active addresses - now runs on demand instead of on mount
  const fetchRecentAddresses = useCallback(async () => {
    try {
      // For Bitcoin, fetch data for active addresses
      const btcAddressData = await fetchActiveBitcoinAddresses();
      
      // For Ethereum, use hardcoded addresses
      const ethAddresses: RecentAddress[] = [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          balance: '8.43921782',
          txCount: 5,
          lastActive: new Date().toISOString()
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          balance: '24.6732901',
          txCount: 12,
          lastActive: new Date().toISOString()
        }
      ];
      
      setRecentAddresses({
        bitcoin: btcAddressData,
        ethereum: ethAddresses
      });
    } catch (error) {
      console.error('Error fetching recent addresses:', error);
    }
  }, [fetchActiveBitcoinAddresses]);

  // Initialize data lazily when needed
  const initializeData = useCallback(() => {
    if (!initialized) {
      fetchPrices();
      fetchRecentAddresses();
      
      // Refresh prices every 5 minutes
      const interval = setInterval(() => {
        fetchPrices();
        fetchRecentAddresses();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [fetchPrices, fetchRecentAddresses, initialized]);

  const getRandomActiveAddress = (cryptoType: CryptoType): string => {
    const addresses = cryptoType === 'bitcoin' ? recentAddresses.bitcoin : recentAddresses.ethereum;
    
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
