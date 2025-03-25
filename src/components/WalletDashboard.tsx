
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { formatCrypto, formatDate, getExplorerUrl, CryptoType } from '@/utils/walletUtils';

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
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent {cryptoType === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-medium ${tx.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'incoming' ? '+ ' : '- '}
                        {formatCrypto(tx.amount, cryptoType)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline">
                        {tx.type === 'incoming' ? 'Received' : 'Sent'}
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
                  {index < transactions.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;
