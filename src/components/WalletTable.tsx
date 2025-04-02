
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Eye, Lock, Copy, ExternalLink, Key, FileText } from 'lucide-react';
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

export interface WalletEntry {
  id: string;
  address: string;
  balance: string | number;
  time?: string;
  date?: string;
  source: 'global' | 'user';
  visualData?: number[];
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

const WalletTable: React.FC<WalletTableProps> = ({ 
  wallets, 
  emptyMessage = "No wallet data available.",
  isAccessLocked = false,
  onRequestUnlock,
  pageSize = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(wallets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, wallets.length);
  const currentWallets = wallets.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  if (wallets.length === 0) {
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
              <TableHead className="w-[180px] text-right">Actions</TableHead>
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
                  <div className="font-mono text-xs">{formatAddress(wallet.address)}</div>
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
                    {/* Copy Address Button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => copyToClipboard(wallet.address)}
                      title="Copy Address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>

                    {/* View on Explorer Button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => openExplorer(wallet.address)}
                      title="View on Explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>

                    {/* View Transactions Button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      title="View Transactions"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>

                    {/* View Seed Phrase Button - Only this is locked */}
                    {isAccessLocked ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={onRequestUnlock}
                        title="Access Locked"
                      >
                        <Lock className="h-3.5 w-3.5 text-amber-500" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        title="View Seed Phrase"
                      >
                        <Key className="h-3.5 w-3.5" />
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
    </div>
  );
};

export default WalletTable;
