
import { useState, useEffect } from 'react';
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
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<{
    bitcoin: RecentAddress[],
    ethereum: RecentAddress[]
  }>({
    bitcoin: [],
    ethereum: []
  });

  const fetchPrices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using CoinGecko's public API (no API key required)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
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
      toast.error('Failed to fetch cryptocurrency prices', {
        description: 'Using estimated prices instead'
      });
      
      // Fallback to mock prices in case the API fails
      setBtcPrice(61432.50);
      setEthPrice(3389.75);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate fetching recent active addresses
  const fetchRecentAddresses = async () => {
    try {
      // In a real app, this would call blockchain APIs to get recent transactions
      // For Bitcoin: mempool.space, blockstream.info, or blockchain.info
      // For Ethereum: etherscan.io or ethplorer.io
      
      // For now, we'll simulate this with hardcoded data
      setRecentAddresses({
        bitcoin: [
          {
            address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            balance: '0.42961058',
            txCount: 3,
            lastActive: new Date().toISOString()
          },
          {
            address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
            balance: '1.27851396',
            txCount: 8,
            lastActive: new Date().toISOString()
          }
        ],
        ethereum: [
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
        ]
      });
    } catch (error) {
      console.error('Error fetching recent addresses:', error);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchRecentAddresses();
    
    // Refresh prices every 5 minutes
    const interval = setInterval(() => {
      fetchPrices();
      fetchRecentAddresses();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getRandomActiveAddress = (cryptoType: CryptoType): string => {
    const addresses = cryptoType === 'bitcoin' ? recentAddresses.bitcoin : recentAddresses.ethereum;
    
    if (addresses.length === 0) {
      // Fallback addresses if no recent ones are available
      return cryptoType === 'bitcoin' 
        ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
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
    getRandomActiveAddress
  };
};
