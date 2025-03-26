
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

  // Fetch active Bitcoin addresses from mempool.space API
  const fetchActiveBitcoinAddresses = async (): Promise<RecentAddress[]> => {
    try {
      // These are known active Bitcoin addresses with transactions
      const addresses = [
        '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', // Binance cold wallet
        '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', // Bitfinex cold wallet
        '3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a', // Coinbase
        '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP', // Kraken
        '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s'  // Huobi
      ];
      
      const addressesWithData: RecentAddress[] = [];
      
      // Fetch actual data for each address
      for (const address of addresses) {
        try {
          const response = await fetch(`https://mempool.space/api/address/${address}`);
          if (response.ok) {
            const data = await response.json();
            
            // Get transaction count and calculate balance
            const chainStats = data.chain_stats || {};
            const mempoolStats = data.mempool_stats || {};
            const txCount = (chainStats.tx_count || 0) + (mempoolStats.tx_count || 0);
            
            // Calculate balance in satoshis (funded - spent)
            const totalFunded = (chainStats.funded_txo_sum || 0) + (mempoolStats.funded_txo_sum || 0);
            const totalSpent = (chainStats.spent_txo_sum || 0) + (mempoolStats.spent_txo_sum || 0);
            const balanceSats = totalFunded - totalSpent;
            
            // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
            const balanceBTC = (balanceSats / 100000000).toFixed(8);
            
            // Get last active time
            // Try to fetch the most recent transaction to get timestamp
            const txsResponse = await fetch(`https://mempool.space/api/address/${address}/txs`);
            let lastActive = new Date().toISOString();
            
            if (txsResponse.ok) {
              const txs = await txsResponse.json();
              if (txs && txs.length > 0 && txs[0].status && txs[0].status.block_time) {
                lastActive = new Date(txs[0].status.block_time * 1000).toISOString();
              }
            }
            
            addressesWithData.push({
              address,
              balance: balanceBTC,
              txCount,
              lastActive
            });
          }
        } catch (error) {
          console.error(`Error fetching data for address ${address}:`, error);
        }
      }
      
      return addressesWithData.length > 0 ? addressesWithData : addresses.map(address => ({
        address,
        balance: '0.00000000',
        txCount: 0,
        lastActive: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching active Bitcoin addresses:', error);
      toast.error('Failed to fetch active Bitcoin addresses');
      return [];
    }
  };

  // Fetch recent active addresses
  const fetchRecentAddresses = async () => {
    try {
      // For Bitcoin, fetch real active addresses with data
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
    getRandomActiveAddress
  };
};
