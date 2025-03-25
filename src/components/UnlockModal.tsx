
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Bitcoin, Coins } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CryptoType } from '@/utils/walletUtils';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  activeCrypto: CryptoType;
}

const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  activeCrypto
}) => {
  const [step, setStep] = useState<'deposit' | 'verify' | 'unlocked'>('deposit');
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isCopied, setIsCopied] = useState<{ btc: boolean; eth: boolean }>({ btc: false, eth: false });

  // Mock addresses for deposit
  const btcDepositAddress = '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5';
  const ethDepositAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const handleCopy = (address: string, type: 'btc' | 'eth') => {
    navigator.clipboard.writeText(address);
    setIsCopied({ ...isCopied, [type]: true });
    toast.success(`${type.toUpperCase()} Address copied to clipboard`);
    
    setTimeout(() => {
      setIsCopied({ ...isCopied, [type]: false });
    }, 2000);
  };

  const handleVerify = () => {
    if (!walletAddress) {
      toast.error('Please enter your wallet address');
      return;
    }
    
    if (!transactionId) {
      toast.error('Please enter your transaction ID');
      return;
    }
    
    // In a real app, this would verify the transaction
    // Mock success for now
    setStep('unlocked');
    
    // Wait 2 seconds before closing modal and unlocking
    setTimeout(() => {
      onUnlock();
      onClose();
      toast.success('Seed phrase access unlocked!');
    }, 2000);
  };

  const requiredAmount = activeCrypto === 'bitcoin' ? '0.10 BTC' : '4 ETH';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'unlocked' ? 'Access Unlocked' : 'Unlock Seed Phrases'}
          </DialogTitle>
          <DialogDescription>
            {step === 'deposit' && (
              <span>Deposit {requiredAmount} to unlock unlimited access to seed phrases.</span>
            )}
            {step === 'verify' && (
              <span>Please verify your transaction details.</span>
            )}
            {step === 'unlocked' && (
              <span>Thank you! Your access has been successfully unlocked.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 'deposit' && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Bitcoin className="h-5 w-5 text-bitcoin mr-2" />
                    <span className="font-medium">Bitcoin Address</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopy(btcDepositAddress, 'btc')}
                  >
                    {isCopied.btc ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {isCopied.btc ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="text-sm font-mono bg-background/80 p-2 rounded break-all">
                  {btcDepositAddress}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Send exactly 0.10 BTC to this address
                </div>
              </div>
              
              <div className="bg-secondary/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Coins className="h-5 w-5 text-ethereum mr-2" />
                    <span className="font-medium">Ethereum Address</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopy(ethDepositAddress, 'eth')}
                  >
                    {isCopied.eth ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {isCopied.eth ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="text-sm font-mono bg-background/80 p-2 rounded break-all">
                  {ethDepositAddress}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Send exactly 4 ETH to this address
                </div>
              </div>
            </div>
            
            <Button className="w-full" onClick={() => setStep('verify')}>
              I've Sent the Payment
            </Button>
          </div>
        )}
        
        {step === 'verify' && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Your Wallet Address</Label>
                <Input
                  id="walletAddress"
                  placeholder="Enter the address you sent from"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter the transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('deposit')}>
                Back
              </Button>
              <Button onClick={handleVerify}>
                Unlock Access
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {step === 'unlocked' && (
          <div className="py-6 text-center">
            <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
              <Check className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Verification successful!</p>
              <p className="text-sm">Your access is now being unlocked</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UnlockModal;
