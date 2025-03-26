
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface AppFooterProps {
  isAccessUnlocked: boolean;
  onToggleDeveloperAccess: () => void;
}

const AppFooter: React.FC<AppFooterProps> = ({
  isAccessUnlocked,
  onToggleDeveloperAccess
}) => {
  return (
    <footer className="py-4 px-4 border-t w-full">
      <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs">
        <p className="text-muted-foreground">
          Quantum Crypto Keybreaker - For educational purposes only
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Developer Mode:</span>
            <div className="flex items-center space-x-2">
              <Switch
                id="developer-mode"
                checked={isAccessUnlocked}
                onCheckedChange={onToggleDeveloperAccess}
              />
              <span className="text-xs font-medium">
                {isAccessUnlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground">
            <span>Built with precision and care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
