
import React from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useNavigate } from 'react-router-dom';
import { Bitcoin, Ethereum } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CryptoNavigationProps {
  activeCrypto: 'bitcoin' | 'ethereum';
  onCryptoChange: (crypto: 'bitcoin' | 'ethereum') => void;
}

const CryptoNavigation: React.FC<CryptoNavigationProps> = ({ 
  activeCrypto, 
  onCryptoChange 
}) => {
  return (
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
            <Ethereum className="h-4 w-4 text-ethereum" />
            Ethereum
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default CryptoNavigation;
