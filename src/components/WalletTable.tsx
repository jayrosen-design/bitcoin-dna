
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
import { formatDate, shortenAddress, formatCrypto, type CryptoType } from '@/utils/walletUtils';
import { Bitcoin, Coins, Eye, ReceiptText } from 'lucide-react';

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
}

type TransactionType = {
  hash: string;
  amount: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
};

const WalletTable: React.FC<WalletTableProps> = ({ wallets, emptyMessage }) => {
  const [selectedSeedPhrase, setSelectedSeedPhrase] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionType[]>([]);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMode, setDialogMode] = useState<'seedPhrase' | 'transactions'>('seedPhrase');

  const handleViewSeedPhrase = (seedPhrase: string[]) => {
    setSelectedSeedPhrase(seedPhrase);
    setDialogTitle('Seed Phrase');
    setDialogMode('seedPhrase');
  };

  const handleViewTransactions = (address: string, cryptoType: CryptoType = 'bitcoin') => {
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

  return (
    <>
      <Table>
        <TableCaption>{emptyMessage}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Found</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead></TableHead>
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
                <TableCell className="font-mono text-xs">
                  {shortenAddress(wallet.address)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCrypto(wallet.balance, wallet.cryptoType)}
                </TableCell>
                <TableCell>
                  {formatDate(wallet.timestamp.toISOString())}
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
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
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default WalletTable;
