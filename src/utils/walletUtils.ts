
import { wordList } from './wordList';
import { toast } from 'sonner';

// Define crypto types
export type CryptoType = 'bitcoin' | 'ethereum';

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

// Mock function to derive address from seed phrase
export const deriveAddress = (seedPhrase: string[], cryptoType: CryptoType = 'bitcoin'): string => {
  // In a real implementation, this would use a proper BIP39/BIP32/BIP44 library
  // For demo purposes, we'll create a deterministic but fake address
  
  // Create a simple hash of the seed phrase
  const seedString = seedPhrase.join(' ');
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Convert to a hex string and use as part of the address
  const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Format address based on crypto type
  if (cryptoType === 'ethereum') {
    return `0x${hashHex}${getRandomHex(32)}`;
  } else {
    // Bitcoin address
    return `bc1q${hashHex}${getRandomHex(24)}`;
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

// Simulate checking if an address has a balance
export const checkAddressBalance = async (address: string, cryptoType: CryptoType = 'bitcoin'): Promise<{
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
    // Simulate network request with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For simulation: 25% chance of having a balance
    const hasBalance = Math.random() < 0.25;
    
    if (!hasBalance) {
      return { hasBalance: false };
    }
    
    // Generate a random balance between 0.001 and 2 units of the crypto
    const balance = (0.001 + Math.random() * 1.999).toFixed(8);
    
    // Generate some fake transactions
    const numTransactions = Math.floor(Math.random() * 5) + 1;
    const transactions = [];
    
    const now = new Date();
    
    for (let i = 0; i < numTransactions; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const txDate = new Date(now);
      txDate.setDate(txDate.getDate() - daysAgo);
      txDate.setHours(txDate.getHours() - hoursAgo);
      txDate.setMinutes(txDate.getMinutes() - minutesAgo);
      
      const txAmount = (0.0001 + Math.random() * (parseFloat(balance) / 2)).toFixed(8);
      
      transactions.push({
        hash: `${getRandomHex(64)}`,
        amount: txAmount,
        timestamp: txDate.toISOString(),
        type: Math.random() > 0.5 ? 'incoming' : 'outgoing'
      });
    }
    
    return {
      hasBalance: true,
      balance,
      transactions: transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    toast.error('Failed to check wallet balance');
    return { hasBalance: false };
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
