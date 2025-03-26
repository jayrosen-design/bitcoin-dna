
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QuantumIntroProps {
  currentValue: number;
  btcValue?: number;
}

const QuantumIntro: React.FC<QuantumIntroProps> = ({ currentValue, btcValue = 0 }) => {
  const [displayValue, setDisplayValue] = useState(currentValue);
  const [displayBtcValue, setDisplayBtcValue] = useState(btcValue);
  const prevValueRef = useRef(currentValue);
  const prevBtcValueRef = useRef(btcValue);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Start animation when currentValue changes
    if (currentValue !== prevValueRef.current) {
      const startValue = prevValueRef.current;
      const endValue = currentValue;
      const duration = 1000; // Animation duration in ms
      const startTime = performance.now();
      
      const animateValue = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use easeOutQuad easing function for smoother animation
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        
        const currentAnimValue = startValue + (endValue - startValue) * easeProgress;
        setDisplayValue(currentAnimValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateValue);
        } else {
          prevValueRef.current = endValue;
        }
      };
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(animateValue);
    }
    
    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentValue]);
  
  useEffect(() => {
    // Start animation when btcValue changes
    if (btcValue !== prevBtcValueRef.current) {
      const startValue = prevBtcValueRef.current;
      const endValue = btcValue;
      const duration = 1000; // Animation duration in ms
      const startTime = performance.now();
      
      const animateBtcValue = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use easeOutQuad easing function for smoother animation
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        
        const currentAnimValue = startValue + (endValue - startValue) * easeProgress;
        setDisplayBtcValue(currentAnimValue);
        
        if (progress < 1) {
          requestAnimationFrame(animateBtcValue);
        } else {
          prevBtcValueRef.current = endValue;
        }
      };
      
      requestAnimationFrame(animateBtcValue);
    }
  }, [btcValue]);

  const formatCurrency = (value: number) => {
    // Format billions
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    // Format millions
    else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    // Format thousands and smaller numbers
    else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    }
  };

  const formatBtc = (value: number) => {
    return `${value.toFixed(1)} BTC`;
  };

  return (
    <Card className="animate-fade-up h-full">
      <CardContent className="pt-6 h-full">
        <div className="flex flex-col h-full">
          <div className="flex flex-col mb-4">
            <h2 className="text-xl font-semibold mb-2">Quantum Crypto Keybreaker</h2>
            <p className="text-muted-foreground">
              Our advanced quantum computing algorithm exploits cryptographic vulnerabilities to crack wallet security. 
              Our system identifies and accesses dormant wallets containing significant cryptocurrency assets.
              Unlock access to these found seed phrases by staking your coin through our secure verification portal.
            </p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <div className="text-center">
                <div className="text-sm font-medium mb-1 text-muted-foreground">Total USD Value Unlocked</div>
                <div className="text-5xl font-bold text-primary">{formatCurrency(displayValue)}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium mb-1 text-muted-foreground">Total BTC Unlocked</div>
                <div className="text-5xl font-bold text-primary">{formatBtc(displayBtcValue)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumIntro;
