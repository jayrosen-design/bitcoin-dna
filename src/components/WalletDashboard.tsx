
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatCrypto, formatDate, getExplorerUrl, CryptoType, shortenAddress } from '@/utils/walletUtils';

interface WalletDashboardProps {
  address: string;
  balance: string;
  transactions: Array<{
    hash: string;
    amount: string;
    timestamp: string;
    type: 'incoming' | 'outgoing';
  }>;
  cryptoType?: CryptoType;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ 
  address, 
  balance, 
  transactions,
  cryptoType = 'bitcoin'
}) => {
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const openExplorer = (hash: string, type: 'transaction' | 'address') => {
    const url = getExplorerUrl(hash, type, cryptoType);
    window.open(url, '_blank');
  };

  // Format the timestamp as relative time (e.g., "2 minutes ago")
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return formatDate(dateString);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Wallet Dashboard
        </h2>
        <Button variant="outline" size="sm" onClick={() => openExplorer(address, 'address')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View on {cryptoType === 'bitcoin' ? 'Explorer' : 'Etherscan'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Details</CardTitle>
            <CardDescription>
              Manage your {cryptoType === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-muted p-2 rounded font-mono break-all">
                  {address}
                </code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(address, 'Address')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Balance</div>
              <div className="text-3xl font-bold">{formatCrypto(balance, cryptoType)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Last {transactions.length} {cryptoType === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} transactions (last 10 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No recent transactions found
                </div>
              ) : (
                transactions.map((tx, index) => (
                  <div key={index} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {tx.type === 'incoming' ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                        )}
                        <div>
                          <div className={`font-medium ${tx.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'incoming' ? '+ ' : '- '}
                            {formatCrypto(tx.amount, cryptoType)}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {getRelativeTime(tx.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant={tx.type === 'incoming' ? "success" : "destructive"} className="capitalize">
                          {tx.type}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => openExplorer(tx.hash, 'transaction')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t text-xs font-mono text-muted-foreground truncate">
                      TX: {shortenAddress(tx.hash)}
                    </div>
                    {index < transactions.length - 1 && <div className="mt-2"></div>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;
