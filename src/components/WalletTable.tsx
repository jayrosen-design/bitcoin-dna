import React, { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDate, shortenAddress, formatCrypto, getExplorerUrl, type CryptoType } from '@/utils/walletUtils';
import { Bitcoin, Coins, Eye, ReceiptText, ExternalLink, Copy, Lock, Globe, User, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

export interface WalletEntry {
  id: string;
  seedPhrase: string[];
  address: string;
  balance: string;
  timestamp: Date;
  cryptoType?: CryptoType;
  source?: 'global' | 'user';
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

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getWalletSource = (wallet: WalletEntry): 'global' | 'user' => {
    if (wallet.source) return wallet.source;
    return wallet.id.startsWith('mock-') ? 'global' : 'user';
  };

  const getSourceIcon = (wallet: WalletEntry) => {
    const source = getWalletSource(wallet);
    return source === 'global' 
      ? <Globe className="h-4 w-4 text-muted-foreground" /> 
      : <User className="h-4 w-4 text-primary" />;
  };

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
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const openExplorer = (address: string, cryptoType: CryptoType = 'bitcoin') => {
    const url = getExplorerUrl(address, 'address', cryptoType);
    window.open(url, '_blank');
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedAndPagedWallets = useMemo(() => {
    const sorted = [...wallets].sort((a, b) => {
      const balanceA = parseFloat(a.balance);
      const balanceB = parseFloat(b.balance);
      
      if (sortDirection === 'asc') {
        return balanceA - balanceB;
      } else {
        return balanceB - balanceA;
      }
    });

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    return sorted.slice(startIndex, endIndex);
  }, [wallets, currentPage, rowsPerPage, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(wallets.length / rowsPerPage));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
            </PaginationItem>
          )}
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page when changing rows per page
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={rowsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              {ROWS_PER_PAGE_OPTIONS.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {wallets.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}-
          {Math.min(currentPage * rowsPerPage, wallets.length)} of {wallets.length}
        </div>
      </div>

      <Table>
        <TableCaption>{emptyMessage}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right cursor-pointer" onClick={toggleSortDirection}>
              <div className="flex items-center justify-end">
                Balance
                <ArrowUpDown className="ml-2 h-4 w-4" />
                <span className="sr-only">
                  Sort by balance ({sortDirection === 'asc' ? 'ascending' : 'descending'})
                </span>
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
            <TableHead></TableHead>
            <TableHead className="text-right">Found</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No wallets found yet
              </TableCell>
            </TableRow>
          ) : (
            sortedAndPagedWallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell>
                  <div className="flex justify-center">
                    {getSourceIcon(wallet)}
                  </div>
                </TableCell>
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
                      className="font-mono text-xs cursor-pointer hover:underline hover:text-primary"
                      onClick={() => openExplorer(wallet.address, wallet.cryptoType)}
                    >
                      {shortenAddress(wallet.address)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5" 
                      onClick={() => copyToClipboard(wallet.address, 'Address')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => openExplorer(wallet.address, wallet.cryptoType)}
                    >
                      <ExternalLink className="h-3 w-3" />
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
                </TableCell>
                <TableCell className="text-right">
                  {formatDate(wallet.timestamp.toISOString())}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {wallets.length > 0 && (
        <div className="mt-4">
          {renderPagination()}
        </div>
      )}
    </>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default WalletTable;
