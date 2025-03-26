
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

// Fetch recent active address from block explorer instead of generating one
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
    
    // Try to fetch a real address from recent blockchain activity
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

// Fetch recent active addresses with balance over threshold
export const fetchRecentActiveAddresses = async (cryptoType: CryptoType): Promise<string[]> => {
  try {
    let apiUrl;
    let minValue;
    
    if (cryptoType === 'bitcoin') {
      // For Bitcoin, we'll simulate fetching from a blockchain API
      // In a real app, you would use a service like Blockstream, Blockcypher, or Blockchain.info
      apiUrl = 'https://mempool.space/api/v1/blocks/tip/hash';
      minValue = 0.1; // Min 0.1 BTC
    } else {
      // For Ethereum, we'll simulate fetching from Etherscan or similar
      apiUrl = 'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber';
      minValue = 4; // Min 4 ETH
    }
    
    // In a real implementation, this would call the respective blockchain API
    // and extract addresses with recent transactions and balance above threshold
    
    // For this simulation, we'll just return some hardcoded addresses
    // that meet our criteria
    if (cryptoType === 'bitcoin') {
      return [
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        'bc1q7cyrfmck2ffu2ud3rn5l5a8yv6f0chkp0zpemf',
        '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
        '1HQ3Go3ggs8pFnXuHVHRytPCq5fGG8Hbhx'
      ];
    } else {
      return [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'
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

// Simulate checking if an address has a balance but using real addresses
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
    // Simulate network request with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For simulation: we always return true for the hardcoded addresses
    // In a real app, you would check the actual balance on the blockchain
    const hasBalance = true;
    
    // Generate a balance above our threshold based on the crypto type
    let balance;
    if (cryptoType === 'bitcoin') {
      // Generate a balance between the min value and a higher value (0.1 - 10 BTC)
      balance = (0.1 + Math.random() * 9.9).toFixed(8);
    } else {
      // Generate a balance between the min value and a higher value (4 - 50 ETH)
      balance = (4 + Math.random() * 46).toFixed(8);
    }
    
    // Fetch up to 5 of the most recent transactions of the wallet address
    const transactions = await fetchRecentTransactions(address || '', cryptoType);
    
    return {
      hasBalance,
      balance,
      transactions
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    toast.error('Failed to check wallet balance');
    return { hasBalance: false };
  }
};

// Fetch recent transactions for a given address
export const fetchRecentTransactions = async (address: string, cryptoType: CryptoType = 'bitcoin'): Promise<Array<{
  hash: string;
  amount: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}>> => {
  try {
    // In a real implementation, this would call the blockchain API
    // for this simulation, we'll generate up to 5 recent transactions
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const numTransactions = Math.floor(Math.random() * 5) + 1;
    const transactions = [];
    
    const now = new Date();
    
    // Create transactions from the last 10 minutes
    for (let i = 0; i < numTransactions; i++) {
      // Generate a transaction time within the last 10 minutes
      const minutesAgo = Math.floor(Math.random() * 10);
      
      const txDate = new Date(now);
      txDate.setMinutes(txDate.getMinutes() - minutesAgo);
      
      // Generate transaction amount based on crypto type
      let txAmount;
      if (cryptoType === 'bitcoin') {
        // Generate a small Bitcoin transaction (0.0001 - 0.5 BTC)
        txAmount = (0.0001 + Math.random() * 0.5).toFixed(8);
      } else {
        // Generate a small Ethereum transaction (0.001 - 2 ETH)
        txAmount = (0.001 + Math.random() * 2).toFixed(8);
      }
      
      // Determine if incoming or outgoing (50/50 chance)
      const txType = Math.random() > 0.5 ? 'incoming' : 'outgoing';
      
      // Generate transaction hash (different format for BTC vs ETH)
      const txHash = cryptoType === 'ethereum' 
        ? `0x${getRandomHex(64)}`
        : getRandomHex(64);
      
      transactions.push({
        hash: txHash,
        amount: txAmount,
        timestamp: txDate.toISOString(),
        type: txType
      });
    }
    
    // Sort transactions by timestamp (newest first)
    return transactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
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
