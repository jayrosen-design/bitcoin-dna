
import React from 'react';
import { cn } from '@/lib/utils';
import { CircleArrowUp, Loader } from 'lucide-react';

interface WalletVisualizerProps {
  status: 'checking' | 'no-balance' | 'has-balance' | 'unlocking' | 'unlocked';
  address: string;
  className?: string;
}

const WalletVisualizer: React.FC<WalletVisualizerProps> = ({ status, address, className }) => {
  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-bitcoin/10 rounded-full animate-pulse"></div>
              <Loader className="w-8 h-8 text-bitcoin animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-1">Checking Wallet</h3>
              <p className="text-sm text-muted-foreground">Searching for funds on the blockchain...</p>
            </div>
          </div>
        );
      
      case 'no-balance':
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <CircleArrowUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-1">No Funds Found</h3>
              <p className="text-sm text-muted-foreground">This wallet doesn't have any Bitcoin.</p>
            </div>
          </div>
        );
      
      case 'has-balance':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-bitcoin/20 flex items-center justify-center animate-pulse-orange">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none"
                className="text-bitcoin"
              >
                <path
                  d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.954 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.415-.614.322.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.54 2.143 1.32.33.54-2.18c2.24.427 3.93.255 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.185 3.137.53 2.75 2.084l.002.006z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-1">Funds Detected!</h3>
              <p className="text-sm text-muted-foreground">Bitcoin found in this wallet</p>
            </div>
          </div>
        );
        
      case 'unlocking':
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full max-w-xs">
              <div className="glass p-6 rounded-lg flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-bitcoin/20 flex items-center justify-center">
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className="text-bitcoin animate-pulse"
                  >
                    <path
                      d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.954 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.415-.614.322.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.54 2.143 1.32.33.54-2.18c2.24.427 3.93.255 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.185 3.137.53 2.75 2.084l.002.006z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-medium">Unlocking Wallet</h4>
                  <p className="text-sm text-muted-foreground">Authenticating with blockchain...</p>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 mt-4">
                  <div className="animate-shimmer h-1.5 rounded-full bg-bitcoin/70 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'unlocked':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 animate-scale-in">
            <div className="relative w-20 h-20 mb-2">
              <div className="absolute inset-0 bg-success/20 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className="text-success"
                >
                  <path
                    d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.954 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.415-.614.322.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.54 2.143 1.32.33.54-2.18c2.24.427 3.93.255 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.185 3.137.53 2.75 2.084l.002.006z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium mb-1">Wallet Unlocked</h3>
              <p className="text-sm text-muted-foreground">Successfully authenticated</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full p-6 flex justify-center", className)}>
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default WalletVisualizer;
