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

const createPixelGraphic = (walletEntry: WalletEntry) => {
  const visualData = walletEntry.visualData || generateVisualDataFromAddress(walletEntry.address);
  
  const pixelContainer = document.createElement('div');
  pixelContainer.className = 'pixel-graphic';
  pixelContainer.style.display = 'grid';
  pixelContainer.style.gridTemplateColumns = 'repeat(3, 6px)';
  pixelContainer.style.gridTemplateRows = 'repeat(4, 6px)';
  pixelContainer.style.gap = '1px';
  
  const calculateColor = (index: number) => {
    const gridSize = 45;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    const r = Math.floor((col / gridSize) * 180) + 30;
    const g = Math.floor((row / gridSize) * 180) + 30;
    const b = Math.floor(((row / gridSize + col / gridSize) / 2) * 180) + 30;
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
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

const generateVisualDataFromAddress = (address: string): number[] => {
  const visualData: number[] = [];
  const addressHash = address.replace(/[^a-f0-9]/ig, '');
  
  for (let i = 0; i < 12; i++) {
    const startPos = (i * 3) % (addressHash.length - 2);
    const hexPair = addressHash.substring(startPos, startPos + 2);
    const value = parseInt(hexPair, 16) % 2048;
    visualData.push(value);
  }
  
  return visualData;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Address copied to clipboard');
};

const openExplorer = (address: string) => {
  window.open(`https://www.blockchain.com/explorer/addresses/btc/${address}`, '_blank');
};

const generateSeedPhrase = (address: string): string[] => {
  const seedPhrase: string[] = [];
  const addressHash = address.replace(/[^a-f0-9]/ig, '');
  
  for (let i = 0; i < 12; i++) {
    const startPos = (i * 3) % (addressHash.length - 2);
    const hexPair = addressHash.substring(startPos, startPos + 2);
    const index = parseInt(hexPair, 16) % wordList.length;
    seedPhrase.push(wordList[index]);
  }
  
  return seedPhrase;
};

const generateTransactions = (address: string, balance: string | number): Array<{
  hash: string;
  amount: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}> => {
  const transactions = [];
  const addressHash = address.replace(/[^a-f0-9]/ig, '');
  const numTransactions = (parseInt(addressHash.substring(0, 2), 16) % 5) + 3;
  const totalBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  const now = new Date();
  
  let remainingBalance = totalBalance;
  
  for (let i = 0; i < numTransactions; i++) {
    const seed = parseInt(addressHash.substring(i * 2, i * 2 + 2), 16);
    const daysAgo = seed % 30;
    const hoursAgo = (seed * 3) % 24;
    const minutesAgo = (seed * 7) % 60;
    
    const txDate = new Date(now);
    txDate.setDate(txDate.getDate() - daysAgo);
    txDate.setHours(txDate.getHours() - hoursAgo);
    txDate.setMinutes(txDate.getMinutes() - minutesAgo);
    
    let txAmount;
    const amountSeed = parseInt(addressHash.substring(i * 3, i * 3 + 4), 16);
    txAmount = 0.01 + (amountSeed % 1000) / 100;
    if (i === numTransactions - 1) {
      txAmount = Math.min(txAmount, remainingBalance);
    } else {
      remainingBalance -= txAmount;
    }
    txAmount = Number(txAmount.toFixed(8));
    
    const txType = i === 0 ? 'incoming' : ((parseInt(addressHash.substring(i * 4, i * 4 + 2), 16) % 2) === 0 ? 'incoming' : 'outgoing');
    
    const txHash = `0x${addressHash.substring(0, 8)}${i}${addressHash.substring(8, 40)}`;
    
    transactions.push({
      hash: txHash,
      amount: txAmount.toString(),
      timestamp: txDate.toISOString(),
      type: txType
    });
  }
  
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
  
  useEffect(() => {
    const processed = wallets.map(wallet => {
      const walletCopy = { ...wallet };
      
      if (!walletCopy.seedPhrase) {
        walletCopy.seedPhrase = generateSeedPhrase(walletCopy.address);
      }
      
      if (!walletCopy.transactions || walletCopy.transactions.length === 0) {
        walletCopy.transactions = generateTransactions(walletCopy.address, walletCopy.balance);
      }
      
      if (!walletCopy.visualData) {
        walletCopy.visualData = generateVisualDataFromAddress(walletCopy.address);
      }
      
      return walletCopy;
    });
    
    setProcessedWallets(processed);
  }, [wallets]);
  
  const totalPages = Math.ceil(processedWallets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, processedWallets.length);
  const currentWallets = processedWallets.slice(startIndex, endIndex);
  
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
