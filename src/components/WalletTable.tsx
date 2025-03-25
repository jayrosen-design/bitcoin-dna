
import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { formatBitcoin, shortenAddress } from '@/utils/walletUtils';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Copy, ExternalLink, CreditCard } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [selectedWallet, setSelectedWallet] = useState<WalletEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const viewTransactions = (wallet: WalletEntry) => {
    setSelectedWallet(wallet);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Seed Phrase</TableHead>
              <TableHead>Transactions</TableHead>
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
                          Seed Phrase
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
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 flex items-center"
                      onClick={() => viewTransactions(wallet)}
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      Transactions
                    </Button>
                  </TableCell>
                  <TableCell>{formatBitcoin(wallet.balance)}</TableCell>
                  <TableCell>{formatDate(wallet.timestamp)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet Transactions</DialogTitle>
            <DialogDescription>
              {selectedWallet && (
                <div className="text-sm text-muted-foreground">
                  Address: {shortenAddress(selectedWallet.address)}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedWallet ? (
              <div className="space-y-4">
                <div className="text-center text-muted-foreground text-sm italic">
                  This is a simulated wallet. In a real application, transaction history would be fetched from the blockchain.
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div className="flex flex-col">
                      <span className="text-xs text-green-600 font-medium">Received</span>
                      <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm text-green-600">+0.00123 BTC</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div className="flex flex-col">
                      <span className="text-xs text-red-600 font-medium">Sent</span>
                      <span className="text-xs text-muted-foreground">{new Date(Date.now() - 86400000).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm text-red-600">-0.00045 BTC</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div className="flex flex-col">
                      <span className="text-xs text-green-600 font-medium">Received</span>
                      <span className="text-xs text-muted-foreground">{new Date(Date.now() - 172800000).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm text-green-600">+0.00789 BTC</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => selectedWallet && openInExplorer(selectedWallet.address)}
                  >
                    View All Transactions
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No wallet selected
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletTable;
