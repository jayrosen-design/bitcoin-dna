
import { wordList } from './wordList';
import { toast } from '@/components/ui/sonner';

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

// Mock function to derive Bitcoin address from seed phrase
export const deriveAddress = (seedPhrase: string[]): string => {
  // In a real implementation, this would use a proper BIP39/BIP32/BIP44 library
  // For demo purposes, we'll create a deterministic but fake Bitcoin address
  
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
  
  // Format as a Bitcoin address (this is just for simulation)
  return `bc1q${hashHex}${getRandomHex(24)}`;
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
export const checkAddressBalance = async (address: string): Promise<{
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
    
    // Generate a random balance between 0.001 and 2 BTC
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

// Format a Bitcoin amount with the BTC symbol
export const formatBitcoin = (amount: string | number): string => {
  return `${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })} BTC`;
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
