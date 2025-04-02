
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Copy, ExternalLink, FileText, Key, Lock } from 'lucide-react';
import { formatAddress } from '@/utils/walletUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from './ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { wordList } from '@/utils/wordList';

export interface WalletEntry {
  id: string;
  address: string;
  balance: string | number;
  time?: string;
  date?: string;
  source: 'global' | 'user';
  visualData?: number[];
  seedPhrase?: string[];
  transactions?: Array<{
    hash: string;
    amount: string;
    timestamp: string;
    type: 'incoming' | 'outgoing';
  }>;
}

interface WalletTableProps {
  wallets: WalletEntry[];
  emptyMessage?: string;
  isAccessLocked?: boolean;
  onRequestUnlock?: () => void;
  pageSize?: number;
}

// Function to create a visual representation based on a seed phrase or hash
const createPixelGraphic = (walletEntry: WalletEntry) => {
  // If visualData exists, use it, otherwise generate from address hash
  const visualData = walletEntry.visualData || generateVisualDataFromAddress(walletEntry.address);
  
  // Create a DOM element for the pixel graphic
  const pixelContainer = document.createElement('div');
  pixelContainer.className = 'pixel-graphic';
  pixelContainer.style.display = 'grid';
  pixelContainer.style.gridTemplateColumns = 'repeat(3, 6px)';
  pixelContainer.style.gridTemplateRows = 'repeat(4, 6px)';
  pixelContainer.style.gap = '1px';
  
  // Calculate color based on grid position
  const calculateColor = (index: number) => {
    const gridSize = 45; // Match with matrix grid size
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    // Calculate RGB components based on position
    const r = Math.floor((col / gridSize) * 180) + 30;
    const g = Math.floor((row / gridSize) * 180) + 30;
    const b = Math.floor(((row / gridSize + col / gridSize) / 2) * 180) + 30;
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Create 12 pixels based on the selected indices
  visualData.forEach(index => {
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    pixel.style.width = '6px';
    pixel.style.height = '6px';
    pixel.style.borderRadius = '1px';
    pixel.style.backgroundColor = calculateColor(index);
    pixelContainer.appendChild(pixel);
  });
  
  return pixelContainer;
};

// Generate visual data from address hash for wallets without visualData
const generateVisualDataFromAddress = (address: string): number[] => {
  const visualData: number[] = [];
  const addressHash = address.replace(/[^a-f0-9]/ig, '');
  
  // Generate 12 pseudo-random indices based on address hash
  for (let i = 0; i < 12; i++) {
    // Take 2 chars from hash at different positions and convert to number
    const startPos = (i * 3) % (addressHash.length - 2);
    const hexPair = addressHash.substring(startPos, startPos + 2);
    const value = parseInt(hexPair, 16) % 2048; // Map to wordlist size (0-2047)
    visualData.push(value);
  }
  
  return visualData;
};

// Helper function to copy text to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Address copied to clipboard');
};

// Helper function to open blockchain explorer
const openExplorer = (address: string) => {
  // Simple implementation - in production should use a service to determine correct explorer
  window.open(`https://www.blockchain.com/explorer/addresses/btc/${address}`, '_blank');
};

// Generate a random seed phrase based on address (deterministic)
const generateSeedPhrase = (address: string): string[] => {
  const seedPhrase: string[] = [];
  const addressHash = address.replace(/[^a-f0-9]/ig, '');
  
  // Use address hash to deterministically select words
  for (let i = 0; i < 12; i++) {
    // Take 2 chars from hash at different positions and convert to number
    const startPos = (i * 3) % (addressHash.length - 2);
    const hexPair = addressHash.substring(startPos, startPos + 2);
    const index = parseInt(hexPair, 16) % wordList.length;
    seedPhrase.push(wordList[index]);
  }
  
  return seedPhrase;
};

// Generate random transactions based on address (deterministic)
const generateTransactions = (address: string, balance: string | number): Array<{
  hash: string;
  amount: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}> => {
  const transactions = [];
  const addressHash = address.replace(/[^a-f0-9]/ig, '');
  const numTransactions = (parseInt(addressHash.substring(0, 2), 16) % 5) + 3; // 3-7 transactions
  const totalBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  const now = new Date();
  
  // Generate transaction dates and amounts
  let remainingBalance = totalBalance;
  
  for (let i = 0; i < numTransactions; i++) {
    // Deterministically create a somewhat realistic timestamp spread over the last 30 days
    const seed = parseInt(addressHash.substring(i * 2, i * 2 + 2), 16);
    const daysAgo = seed % 30;
    const hoursAgo = (seed * 3) % 24;
    const minutesAgo = (seed * 7) % 60;
    
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
      const portion = 0.1 + (parseInt(addressHash.substring(i * 2, i * 2 + 2), 16) % 20) / 100;
      txAmount = remainingBalance * portion;
      remainingBalance -= txAmount;
    }
    
    // Ensure the amount has the right number of decimal places
    txAmount = Number(txAmount.toFixed(8));
    
    // Determine transaction type
    const txType = i === 0 ? 'incoming' : ((parseInt(addressHash.substring(i * 4, i * 4 + 2), 16) % 2) === 0 ? 'incoming' : 'outgoing');
    
    // Generate transaction hash (use address hash + position for deterministic but unique hash)
    const txHash = `0x${addressHash.substring(0, 8)}${i}${addressHash.substring(8, 40)}`;
    
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
};

const WalletTable: React.FC<WalletTableProps> = ({ 
  wallets, 
  emptyMessage = "No wallet data available.",
  isAccessLocked = false,
  onRequestUnlock,
  pageSize = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletEntry | null>(null);
  const [selectedSeedPhrase, setSelectedSeedPhrase] = useState<WalletEntry | null>(null);
  const [processedWallets, setProcessedWallets] = useState<WalletEntry[]>([]);
  
  // Process wallets to ensure they all have seed phrases and transactions
  useEffect(() => {
    // Create a deep copy of wallets with added data where needed
    const processed = wallets.map(wallet => {
      const walletCopy = { ...wallet };
      
      // If no seed phrase, generate one deterministically from address
      if (!walletCopy.seedPhrase) {
        walletCopy.seedPhrase = generateSeedPhrase(walletCopy.address);
      }
      
      // If no transactions, generate some deterministically from address
      if (!walletCopy.transactions || walletCopy.transactions.length === 0) {
        walletCopy.transactions = generateTransactions(walletCopy.address, walletCopy.balance);
      }
      
      // If no visual data, generate it
      if (!walletCopy.visualData) {
        walletCopy.visualData = generateVisualDataFromAddress(walletCopy.address);
      }
      
      return walletCopy;
    });
    
    setProcessedWallets(processed);
  }, [wallets]);
  
  // Calculate pagination
  const totalPages = Math.ceil(processedWallets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, processedWallets.length);
  const currentWallets = processedWallets.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleViewTransactions = (wallet: WalletEntry) => {
    setSelectedTransaction(wallet);
  };
  
  const handleViewSeedPhrase = (wallet: WalletEntry) => {
    if (isAccessLocked) {
      onRequestUnlock?.();
      return;
    }
    setSelectedSeedPhrase(wallet);
  };
  
  if (processedWallets.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <div className="rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Visual</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[100px] text-right">Balance</TableHead>
              <TableHead className="w-[100px] text-right">Time</TableHead>
              <TableHead className="w-[100px] text-right">Date</TableHead>
              <TableHead className="w-[200px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentWallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell className="py-2">
                  <div
                    ref={el => {
                      if (el) {
                        el.innerHTML = '';
                        el.appendChild(createPixelGraphic(wallet));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div 
                      className="font-mono text-xs cursor-pointer hover:underline"
                      onClick={() => openExplorer(wallet.address)}
                      title="View on Explorer"
                    >
                      {formatAddress(wallet.address)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 ml-1" 
                      onClick={() => copyToClipboard(wallet.address)}
                      title="Copy Address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {typeof wallet.balance === 'number' 
                    ? wallet.balance.toFixed(8)
                    : wallet.balance} BTC
                </TableCell>
                <TableCell className="text-right">{wallet.time || '—'}</TableCell>
                <TableCell className="text-right">{wallet.date || '—'}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {/* View Transactions Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewTransactions(wallet)}
                      className="text-xs h-7"
                      title="View Transactions"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Transactions
                    </Button>

                    {/* View Seed Phrase Button */}
                    {isAccessLocked ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={onRequestUnlock}
                        className="text-xs h-7"
                        title="Access Locked"
                      >
                        <Lock className="h-3.5 w-3.5 mr-1 text-amber-500" />
                        Seed Phrase
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewSeedPhrase(wallet)}
                        className="text-xs h-7"
                        title="View Seed Phrase"
                      >
                        <Key className="h-3.5 w-3.5 mr-1" />
                        Seed Phrase
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Transactions Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {selectedTransaction?.transactions?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTransaction.transactions.map((tx, idx) => (
                    <TableRow key={idx}>
                      <TableCell className={tx.type === 'incoming' ? 'text-green-500' : 'text-red-500'}>
                        {tx.type === 'incoming' ? '↓ Received' : '↑ Sent'}
                      </TableCell>
                      <TableCell>{tx.amount} BTC</TableCell>
                      <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs text-right">
                        {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transaction history available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Seed Phrase Dialog */}
      <Dialog open={!!selectedSeedPhrase} onOpenChange={() => setSelectedSeedPhrase(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Seed Phrase</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md p-4 bg-muted/30">
            {selectedSeedPhrase?.seedPhrase ? (
              <div className="grid grid-cols-3 gap-2">
                {selectedSeedPhrase.seedPhrase.map((word, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-muted-foreground mr-2 text-xs font-mono">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-medium">{word}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Seed phrase not available for this wallet
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Warning: Never share your seed phrase with anyone
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletTable;
