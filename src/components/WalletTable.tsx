
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Eye, Lock } from 'lucide-react';
import { formatAddress } from '@/utils/walletUtils';
import { Skeleton } from '@/components/ui/skeleton';

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

const WalletTable: React.FC<WalletTableProps> = ({ 
  wallets, 
  emptyMessage = "No wallet data available.",
  isAccessLocked = false,
  onRequestUnlock 
}) => {
  
  if (wallets.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {isAccessLocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-md">
          <Lock className="h-12 w-12 text-amber-500 mb-2" />
          <p className="text-gray-600 mb-4">Address data is hidden</p>
          <Button onClick={onRequestUnlock} className="gap-2" variant="outline" size="sm">
            <Eye className="h-4 w-4" />
            View Addresses
          </Button>
        </div>
      )}
      
      <div className="rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Visual</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[100px] text-right">Balance</TableHead>
              <TableHead className="w-[100px] text-right">Time</TableHead>
              <TableHead className="w-[100px] text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallets.map((wallet) => (
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
                  {isAccessLocked ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="font-mono text-xs">{formatAddress(wallet.address)}</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {typeof wallet.balance === 'number' 
                    ? wallet.balance.toFixed(8)
                    : wallet.balance} BTC
                </TableCell>
                <TableCell className="text-right">{wallet.time || '—'}</TableCell>
                <TableCell className="text-right">{wallet.date || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WalletTable;
