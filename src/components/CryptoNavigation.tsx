
import React from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Bitcoin, Coins, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { CryptoType } from '@/utils/walletUtils';

interface CryptoNavigationProps {
  activeCrypto: CryptoType;
  onCryptoChange: (crypto: CryptoType) => void;
  isAccessUnlocked?: boolean;
  onToggleUnlock?: () => void;
  className?: string;
}

const CryptoNavigation: React.FC<CryptoNavigationProps> = ({ 
  activeCrypto, 
  onCryptoChange,
  isAccessUnlocked = false,
  onToggleUnlock,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "gap-2",
                activeCrypto === 'bitcoin' ? "bg-accent/50" : ""
              )}
              onClick={() => onCryptoChange('bitcoin')}
            >
              <Bitcoin className="h-4 w-4 text-bitcoin" />
              Bitcoin
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "gap-2",
                activeCrypto === 'ethereum' ? "bg-accent/50" : ""
              )}
              onClick={() => onCryptoChange('ethereum')}
            >
              <Coins className="h-4 w-4 text-ethereum" />
              Ethereum
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      {onToggleUnlock && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleUnlock}
          className="ml-2"
        >
          {isAccessUnlocked ? (
            <>
              <Unlock className="h-4 w-4 mr-1" />
              Unlocked
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-1" />
              Unlock
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default CryptoNavigation;
