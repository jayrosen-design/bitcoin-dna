
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WalletTable, { WalletEntry } from '@/components/WalletTable';
import { Loader, Globe, User } from 'lucide-react';

interface TabbedWalletTableProps {
  myWallets: WalletEntry[];
  globalWallets: WalletEntry[];
  isRandomWalletsLoading: boolean;
  emptyMessage?: string;
  isAccessLocked?: boolean;
  onRequestUnlock?: () => void;
}

const TabbedWalletTable: React.FC<TabbedWalletTableProps> = ({
  myWallets,
  globalWallets,
  isRandomWalletsLoading,
  emptyMessage,
  isAccessLocked,
  onRequestUnlock,
}) => {
  const [activeTab, setActiveTab] = useState<"global" | "my">("global");

  return (
    <Tabs 
      defaultValue="global" 
      className="w-full"
      onValueChange={(value) => setActiveTab(value as "global" | "my")}
    >
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="global">
            <Globe className="h-4 w-4 mr-2" />
            Global Wallets Found
          </TabsTrigger>
          <TabsTrigger value="my">
            <User className="h-4 w-4 mr-2" />
            My Wallets Found
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="global" className="mt-0">
        {isRandomWalletsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading global wallets data...</span>
          </div>
        ) : (
          <WalletTable 
            wallets={globalWallets}
            emptyMessage="Fetching global wallet data..."
            isAccessLocked={isAccessLocked}
            onRequestUnlock={onRequestUnlock}
          />
        )}
      </TabsContent>
      
      <TabsContent value="my" className="mt-0">
        <WalletTable 
          wallets={myWallets}
          emptyMessage={emptyMessage}
          isAccessLocked={isAccessLocked}
          onRequestUnlock={onRequestUnlock}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TabbedWalletTable;
