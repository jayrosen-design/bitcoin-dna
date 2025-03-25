
import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { formatBitcoin, shortenAddress } from '@/utils/walletUtils';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

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
}

const WalletTable: React.FC<WalletTableProps> = ({ wallets }) => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
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
                <TableCell className="font-mono">{shortenAddress(wallet.address)}</TableCell>
                <TableCell>{formatBitcoin(wallet.balance)}</TableCell>
                <TableCell>{formatDate(wallet.timestamp)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                No wallets generated yet with balance
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WalletTable;
