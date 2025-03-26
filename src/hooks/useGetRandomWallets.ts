
import { useState, useEffect } from 'react';
import { WalletEntry } from './useWalletGenerator';
import { CryptoType } from '@/utils/walletUtils';

// Famous Bitcoin addresses to fetch real data from
const FAMOUS_ADDRESSES = [
  '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s', // Satoshi address
  '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP', // MtGox address
  '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', // Binance Cold Wallet
  '3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a', // Coinbase address
  '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', // Bitfinex address
];

export const useGetRandomWallets = () => {
  const [randomWallets, setRandomWallets] = useState<WalletEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRandomWallets = async () => {
      setIsLoading(true);
      try {
        const wallets: WalletEntry[] = [];

        // Fetch data from each famous address
        for (const address of FAMOUS_ADDRESSES) {
          try {
            // Get address info from mempool.space API
            const response = await fetch(`https://mempool.space/api/address/${address}`);
            const addressData = await response.json();
            
            // Get recent transactions
            const txResponse = await fetch(`https://mempool.space/api/address/${address}/txs`);
            const txs = await txResponse.json();

            if (txs && txs.length > 0) {
              // Take a random transaction
              const randomTx = txs[Math.floor(Math.random() * Math.min(txs.length, 5))];
              
              // Find a random output value from this transaction
              let valueInSatoshis = 0;
              if (randomTx.vout && randomTx.vout.length > 0) {
                const randomOutput = randomTx.vout[Math.floor(Math.random() * randomTx.vout.length)];
                valueInSatoshis = randomOutput.value || 0;
              }
              
              // Convert satoshis to BTC
              const balanceInBTC = (valueInSatoshis / 100000000).toFixed(8);
              
              // Get the unixtime from the transaction and convert to a Date
              const timestamp = randomTx.status?.block_time 
                ? new Date(randomTx.status.block_time * 1000) 
                : new Date();
              
              // Create a "random" wallet entry with real blockchain data
              const wallet: WalletEntry = {
                id: Math.random().toString(36).substring(2, 9),
                seedPhrase: Array(12).fill('').map(() => 
                  Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7)
                ),
                address: address,
                balance: balanceInBTC,
                timestamp: timestamp,
                cryptoType: 'bitcoin',
              };
              
              wallets.push(wallet);
            }
          } catch (error) {
            console.error(`Error fetching data for address ${address}:`, error);
          }
        }

        setRandomWallets(wallets);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching random wallets:', error);
        setIsLoading(false);
      }
    };

    fetchRandomWallets();
  }, []);

  return { randomWallets, isLoading };
};
