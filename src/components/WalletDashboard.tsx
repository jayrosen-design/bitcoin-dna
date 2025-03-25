
import React from 'react';
import { cn } from '@/lib/utils';
import { formatBitcoin, formatDate, shortenAddress } from '@/utils/walletUtils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleArrowUp, CircleArrowDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Transaction {
  hash: string;
  amount: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}

interface WalletDashboardProps {
  address: string;
  balance: string;
  transactions: Transaction[];
  className?: string;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({
  address,
  balance,
  transactions,
  className,
}) => {
  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Wallet Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm bg-secondary/50 p-2 rounded overflow-hidden overflow-ellipsis">
                {address}
              </div>
              <Button variant="ghost" size="icon" className="ml-2 flex-shrink-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2 bg-bitcoin/10">
            <CardTitle className="text-lg font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <div className="text-3xl font-bold tracking-tighter text-foreground">
                {formatBitcoin(balance)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Last updated: {formatDate(new Date().toISOString())}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div key={tx.hash} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        tx.type === 'incoming' ? "bg-success/10" : "bg-muted/50"
                      )}>
                        {tx.type === 'incoming' ? (
                          <CircleArrowDown className="h-5 w-5 text-success" />
                        ) : (
                          <CircleArrowUp className="h-5 w-5 text-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {tx.type === 'incoming' ? 'Received' : 'Sent'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "text-right font-medium",
                      tx.type === 'incoming' ? "text-success" : ""
                    )}>
                      {tx.type === 'incoming' ? '+' : '-'}
                      {formatBitcoin(tx.amount)}
                    </div>
                  </div>
                  {index < transactions.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-secondary/30 px-6 py-3">
          <Button variant="link" className="text-sm mx-auto">
            View All Transactions
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WalletDashboard;
