
import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { formatBitcoin, shortenAddress } from '@/utils/walletUtils';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Copy, ExternalLink } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';

export type WalletEntry = {
  id: string;
  seedPhrase: string[];
  address: string;
  balance: string;
  timestamp: Date;
};

type SortField = 'timestamp' | 'balance';
type SortDirection = 'asc' | 'desc';

interface WalletTableProps {
  wallets: WalletEntry[];
  emptyMessage?: string;
}

const WalletTable: React.FC<WalletTableProps> = ({ 
  wallets, 
  emptyMessage = 'No wallets generated yet with balance' 
}) => {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedWallets = [...wallets].sort((a, b) => {
    if (sortField === 'timestamp') {
      return sortDirection === 'asc' 
        ? a.timestamp.getTime() - b.timestamp.getTime()
        : b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return sortDirection === 'asc'
        ? parseFloat(a.balance) - parseFloat(b.balance)
        : parseFloat(b.balance) - parseFloat(a.balance);
    }
  });

  const formatDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string, type: 'address' | 'seed phrase') => {
    navigator.clipboard.writeText(text);
    toast.success(`${type === 'address' ? 'Address' : 'Seed phrase'} copied to clipboard`);
  };

  const openInExplorer = (address: string) => {
    toast.info('This is a simulated address. Opening a Bitcoin explorer to demonstrate how it would work with a real address.');
    
    // Using blockchain.com explorer with the full address
    window.open(`https://blockchair.com/bitcoin/address/${address}`, '_blank');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Seed Phrase</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('balance')}
                className="flex items-center gap-1 px-0"
              >
                Balance
                {sortField === 'balance' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => toggleSort('timestamp')}
                className="flex items-center gap-1 px-0"
              >
                Generated
                {sortField === 'timestamp' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedWallets.length > 0 ? (
            sortedWallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="font-mono text-primary hover:underline flex items-center"
                      onClick={() => openInExplorer(wallet.address)}
                    >
                      {shortenAddress(wallet.address)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => copyToClipboard(wallet.address, 'address')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6">
                        View Seed Phrase
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto max-w-sm p-4 bg-background border">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Seed Phrase</div>
                        <div className="text-xs grid grid-cols-3 gap-2">
                          {wallet.seedPhrase.map((word, i) => (
                            <div key={i} className="flex items-center">
                              <span className="text-muted-foreground mr-1">{i+1}.</span>
                              {word}
                            </div>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => copyToClipboard(wallet.seedPhrase.join(' '), 'seed phrase')}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          Copy Seed Phrase
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>{formatBitcoin(wallet.balance)}</TableCell>
                <TableCell>{formatDate(wallet.timestamp)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WalletTable;
