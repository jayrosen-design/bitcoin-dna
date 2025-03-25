import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate, shortenAddress, formatCrypto, getExplorerUrl, type CryptoType } from '@/utils/walletUtils';
import { Bitcoin, Coins, Eye, ReceiptText, ExternalLink, Copy, Lock } from 'lucide-react';
import { toast } from 'sonner';

export interface WalletEntry {
  id: string;
  seedPhrase: string[];
  address: string;
  balance: string;
  timestamp: Date;
  cryptoType?: CryptoType;
}

interface WalletTableProps {
  wallets: WalletEntry[];
  emptyMessage?: string;
  isAccessLocked?: boolean;
  onRequestUnlock?: () => void;
}

type TransactionType = {
  hash: string;
  amount: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
};

const WalletTable: React.FC<WalletTableProps> = ({ 
  wallets, 
  emptyMessage, 
  isAccessLocked = false,
  onRequestUnlock 
}) => {
  const [selectedSeedPhrase, setSelectedSeedPhrase] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionType[]>([]);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMode, setDialogMode] = useState<'seedPhrase' | 'transactions'>('seedPhrase');

  const handleViewSeedPhrase = (seedPhrase: string[]) => {
    if (isAccessLocked) {
      onRequestUnlock?.();
      return;
    }
    setSelectedSeedPhrase(seedPhrase);
    setDialogTitle('Seed Phrase');
    setDialogMode('seedPhrase');
  };

  const handleViewTransactions = (address: string, cryptoType: CryptoType = 'bitcoin') => {
    if (isAccessLocked) {
      onRequestUnlock?.();
      return;
    }
    // Generate mock transactions for demonstration
    const mockTransactions: TransactionType[] = Array(Math.floor(Math.random() * 5) + 2)
      .fill(null)
      .map((_, index) => {
        const now = new Date();
        const timestamp = new Date(now.setDate(now.getDate() - index)).toISOString();
        const amount = (Math.random() * 0.5 + 0.01).toFixed(6);
        const type = Math.random() > 0.5 ? 'incoming' : 'outgoing';
        
        return {
          hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          amount,
          timestamp,
          type
        };
      });
    
    setSelectedTransactions(mockTransactions);
    setDialogTitle(`Transactions for ${shortenAddress(address)}`);
    setDialogMode('transactions');
  };

  const getCryptoIcon = (type?: CryptoType) => {
    return type === 'ethereum' ? 
      <Coins className="h-4 w-4 text-ethereum" /> : 
      <Bitcoin className="h-4 w-4 text-bitcoin" />;
  };

  const copyToClipboard = (text: string, description: string) => {
    if (isAccessLocked) {
      onRequestUnlock?.();
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const openExplorer = (address: string, cryptoType: CryptoType = 'bitcoin') => {
    if (isAccessLocked) {
      onRequestUnlock?.();
      return;
    }
    const url = getExplorerUrl(address, 'address', cryptoType);
    window.open(url, '_blank');
  };

  return (
    <>
      <Table>
        <TableCaption>{emptyMessage}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead></TableHead>
            <TableHead className="text-right">Found</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No wallets found yet
              </TableCell>
            </TableRow>
          ) : (
            wallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {getCryptoIcon(wallet.cryptoType)}
                    <span className="ml-2">
                      {wallet.cryptoType === 'ethereum' ? 'ETH' : 'BTC'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={cn(
                        "font-mono text-xs",
                        !isAccessLocked && "cursor-pointer hover:underline hover:text-primary"
                      )}
                      onClick={() => !isAccessLocked && openExplorer(wallet.address, wallet.cryptoType)}
                    >
                      {shortenAddress(wallet.address)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5" 
                      onClick={() => copyToClipboard(wallet.address, 'Address')}
                      disabled={isAccessLocked}
                    >
                      {isAccessLocked ? <Lock className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => openExplorer(wallet.address, wallet.cryptoType)}
                      disabled={isAccessLocked}
                    >
                      {isAccessLocked ? <Lock className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCrypto(wallet.balance, wallet.cryptoType)}
                </TableCell>
                <TableCell>
                  {isAccessLocked ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onRequestUnlock}
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Unlock to View
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSeedPhrase(wallet.seedPhrase)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Seed Phrase
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{dialogTitle}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {dialogMode === 'seedPhrase' ? (
                            <div>
                              <div className="flex justify-end mb-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(wallet.seedPhrase.join(' '), 'Seed phrase')}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy All
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {selectedSeedPhrase.map((word, i) => (
                                  <div key={i} className="flex items-center space-x-2">
                                    <span className="text-muted-foreground text-xs">
                                      {(i + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="font-medium">{word}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedTransactions.map((tx, i) => (
                                <div key={i} className="border p-3 rounded-md">
                                  <div className="flex justify-between items-center">
                                    <div className={`font-medium ${tx.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                                      {tx.type === 'incoming' ? '+ ' : '- '}
                                      {formatCrypto(tx.amount, wallet.cryptoType)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDate(tx.timestamp)}
                                    </div>
                                  </div>
                                  <div className="mt-1 text-xs font-mono text-muted-foreground truncate">
                                    {tx.hash.substring(0, 16)}...{tx.hash.substring(tx.hash.length - 16)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
                <TableCell>
                  {isAccessLocked ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onRequestUnlock}
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewTransactions(wallet.address, wallet.cryptoType)}
                        >
                          <ReceiptText className="h-3 w-3 mr-1" />
                          Transactions
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{dialogTitle}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <div className="space-y-3">
                            {selectedTransactions.map((tx, i) => (
                              <div key={i} className="border p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                  <div className={`font-medium ${tx.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'incoming' ? '+ ' : '- '}
                                    {formatCrypto(tx.amount, wallet.cryptoType)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(tx.timestamp)}
                                  </div>
                                </div>
                                <div className="mt-1 text-xs font-mono text-muted-foreground truncate">
                                  {tx.hash.substring(0, 16)}...{tx.hash.substring(tx.hash.length - 16)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatDate(wallet.timestamp.toISOString())}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
};

// Helper function for class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default WalletTable;
