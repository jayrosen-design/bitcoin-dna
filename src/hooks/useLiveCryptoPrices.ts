
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CryptoPriceResponse {
  bitcoin?: { usd: number };
  ethereum?: { usd: number };
}

export const useLiveCryptoPrices = () => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchPrices();
    
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    btcPrice,
    ethPrice,
    isLoading,
    error,
    refetch: fetchPrices
  };
};
