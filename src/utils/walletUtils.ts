
import { wordList } from './wordList';
import { toast } from 'sonner';

// Define crypto types
export type CryptoType = 'bitcoin' | 'ethereum';

// Format address for display (shortened with ellipsis)
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 16) return address;
  
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
};

// Generate a random seed phrase
export const generateSeedPhrase = (): string[] => {
  const seedPhrase: string[] = [];
  
  // Select 12 random words from the wordlist
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    seedPhrase.push(wordList[randomIndex]);
  }
  
  return seedPhrase;
};

// Derive an address from a seed phrase (mock implementation)
export const deriveAddress = async (seedPhrase: string[], cryptoType: CryptoType = 'bitcoin'): Promise<string> => {
  try {
    // For simulation purposes, we'll use the seed phrase to create a deterministic but fake address
    // if the real API call fails
    const seedString = seedPhrase.join(' ');
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Convert to a hex string and use as part of the address
    const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
    
    // Get an address from the known addresses list for a realistic simulation
    const recentAddresses = await fetchRecentActiveAddresses(cryptoType);
    
    if (recentAddresses && recentAddresses.length > 0) {
      // Select a random address from the fetched ones
      const randomIndex = Math.floor(Math.random() * recentAddresses.length);
      return recentAddresses[randomIndex];
    }
    
    // Fallback to generated address if API fails
    if (cryptoType === 'ethereum') {
      return `0x${hashHex}${getRandomHex(32)}`;
    } else {
      // Bitcoin address
      return `bc1q${hashHex}${getRandomHex(24)}`;
    }
  } catch (error) {
    console.error('Error deriving address:', error);
    
    // Fallback to deterministic address generation
    if (cryptoType === 'ethereum') {
      return `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`;
    } else {
      return `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`;
    }
  }
};

// Fixed list of known active addresses (no API calls)
export const fetchRecentActiveAddresses = async (cryptoType: CryptoType): Promise<string[]> => {
  try {
    // For Bitcoin, we'll use some known active addresses
    if (cryptoType === 'bitcoin') {
      return [
        '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', // Binance cold wallet
        '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', // Bitfinex cold wallet
        '3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a', // Coinbase
        '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP', // Kraken
        '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s'  // Huobi
      ];
    } else {
      // For Ethereum, return some known active addresses
      return [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH contract
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
        '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'  // Binance hot wallet
      ];
    }
  } catch (error) {
    console.error('Error fetching recent addresses:', error);
    return [];
  }
};

// Helper to generate random hex characters
const getRandomHex = (length: number): string => {
  let result = '';
  const characters = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate a deterministic but unique balance based on the address
const generateUniqueBalance = (address: string, cryptoType: CryptoType): string => {
  // Use the last 6 characters of the address to create a deterministic but seemingly random balance
  const lastChars = address.slice(-6);
  let seed = 0;
  
  // Convert characters to a number for seed
  for (let i = 0; i < lastChars.length; i++) {
    seed += lastChars.charCodeAt(i);
  }
  
  // Generate a balance with a realistic range
  // For BTC: typically between 0.01 and 2 BTC for "found" wallets
  // For ETH: typically between 0.5 and 20 ETH
  const random = Math.abs(Math.sin(seed)); // Deterministic "random" between 0-1
  
  let balance: number;
  if (cryptoType === 'bitcoin') {
    // 0.01 - 2 BTC range
    balance = 0.01 + (random * 1.99);
  } else {
    // 0.5 - 20 ETH range
    balance = 0.5 + (random * 19.5);
  }
  
  // Format to 8 decimal places
  return balance.toFixed(8);
};

// REMOVED: fetchBitcoinAddressData - no more API calls to mempool.space

// Simulate checking if an address has a balance but using MOCKED data
export const checkAddressBalance = async (cryptoType: CryptoType = 'bitcoin', address?: string): Promise<{
  hasBalance: boolean;
  balance?: string;
  transactions?: Array<{
    hash: string;
    amount: string;
    timestamp: string;
    type: 'incoming' | 'outgoing';
  }>;
}> => {
  try {
    // Generate a unique balance based on the address
    const balance = generateUniqueBalance(address || '', cryptoType);
    
    // Generate transactions that reflect portions of the total balance
    const totalBalance = parseFloat(balance);
    const transactions = await generateFallbackTransactions(address || '', cryptoType, totalBalance);
    
    return {
      hasBalance: true,
      balance,
      transactions
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    toast.error('Failed to check wallet balance');
    return { hasBalance: false };
  }
};

// Generate fallback transactions when API fails
const generateFallbackTransactions = async (
  address: string, 
  cryptoType: CryptoType = 'bitcoin',
  totalBalance: number
): Promise<Array<{
  hash: string;
  amount: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}>> => {
  try {
    const numTransactions = Math.floor(Math.random() * 3) + 3; // 3-5 transactions
    const transactions = [];
    const now = new Date();
    
    // Calculate transaction amounts that sum up close to the total balance
    let remainingBalance = totalBalance;
    
    for (let i = 0; i < numTransactions; i++) {
      // Create a somewhat realistic timestamp spread over the last few days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const txDate = new Date(now);
      txDate.setDate(txDate.getDate() - daysAgo);
      txDate.setHours(txDate.getHours() - hoursAgo);
      txDate.setMinutes(txDate.getMinutes() - minutesAgo);
      
      // Last transaction uses remaining balance, others use portions
      let txAmount;
      if (i === numTransactions - 1) {
        txAmount = remainingBalance;
      } else {
        // Generate a portion of the remaining balance (10-30%)
        const portion = 0.1 + Math.random() * 0.2;
        txAmount = remainingBalance * portion;
        remainingBalance -= txAmount;
      }
      
      // Ensure the amount has the right number of decimal places
      txAmount = Number(txAmount.toFixed(8));
      
      const txType = i === 0 ? 'incoming' : (Math.random() > 0.5 ? 'incoming' : 'outgoing');
      
      // Generate transaction hash
      const txHash = cryptoType === 'ethereum' 
        ? `0x${getRandomHex(64)}`
        : getRandomHex(64);
      
      transactions.push({
        hash: txHash,
        amount: txAmount.toString(),
        timestamp: txDate.toISOString(),
        type: txType
      });
    }
    
    // Sort transactions by timestamp (newest first)
    return transactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
  } catch (error) {
    console.error('Error generating fallback transactions:', error);
    return [];
  }
};

// Get explorer URL for transaction or address
export const getExplorerUrl = (hash: string, type: 'transaction' | 'address', cryptoType: CryptoType = 'bitcoin'): string => {
  if (cryptoType === 'ethereum') {
    return `https://etherscan.io/${type === 'transaction' ? 'tx' : 'address'}/${hash}`;
  } else {
    return `https://mempool.space/${type}/${hash}`;
  }
};

// Format a cryptocurrency amount with the symbol
export const formatCrypto = (amount: string | number, cryptoType: CryptoType = 'bitcoin'): string => {
  const symbol = cryptoType === 'ethereum' ? 'ETH' : 'BTC';
  return `${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })} ${symbol}`;
};

// Format a date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Shorten address for display
export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
};
