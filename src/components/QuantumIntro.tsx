
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import ValueUnlockedChart from '@/components/ValueUnlockedChart';

interface QuantumIntroProps {
  currentValue: number;
}

const QuantumIntro: React.FC<QuantumIntroProps> = ({ currentValue }) => {
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    // Initialize chart data with historical values (starting at 24 million)
    if (chartData.length === 0) {
      const initialData = [];
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
      
      // Create data points from 24 million to the current value
      const intervals = 14; // Two data points per day
      for (let i = 0; i <= intervals; i++) {
        const pointDate = new Date(startDate.getTime() + ((endDate.getTime() - startDate.getTime()) * (i / intervals)));
        
        // Create a more gradual, non-linear growth curve with easing
        const progress = Math.pow(i / intervals, 1.3); // Non-linear growth curve
        const baseValue = 24000000 + ((currentValue - 24000000) * progress);
        
        // Add some random fluctuations (+/- 2%) for a more realistic chart
        const fluctuation = baseValue * (Math.random() * 0.04 - 0.02);
        const value = Math.round(baseValue + fluctuation);
        
        initialData.push({
          time: pointDate.toLocaleDateString('en-US', { weekday: 'short' }),
          value: value
        });
      }
      
      setChartData(initialData);
    } else {
      // Add new data point with current value
      const now = new Date();
      const newTimeStr = now.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Check if we should update the last point or add a new one
      const lastPoint = chartData[chartData.length - 1];
      if (lastPoint.time === newTimeStr) {
        // Update the last point
        const updatedData = [...chartData];
        updatedData[updatedData.length - 1] = { ...lastPoint, value: currentValue };
        setChartData(updatedData);
      } else {
        // Add a new point and remove oldest if more than 15 points
        const newData = [...chartData, { time: newTimeStr, value: currentValue }];
        if (newData.length > 15) {
          newData.shift();
        }
        setChartData(newData);
      }
    }
  }, [currentValue]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="animate-fade-up h-full">
      <CardContent className="pt-6 h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Quantum Crypto Keybreaker</h2>
              <p className="text-muted-foreground">
                Our advanced quantum algorithm scans the blockchain for vulnerable wallets and seed phrases. 
                Generate, scan, and unlock Bitcoin wallets with our cutting-edge technology. 
                Monitor real-time statistics of unlocked wallets and digital assets recovered by our system.
              </p>
            </div>
          </div>
          
          <div className="flex-grow mt-4">
            <ValueUnlockedChart 
              chartData={chartData} 
              formatCurrency={formatCurrency} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumIntro;
