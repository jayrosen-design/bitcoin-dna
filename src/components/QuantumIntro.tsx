
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface QuantumIntroProps {
  currentValue: number;
}

const QuantumIntro: React.FC<QuantumIntroProps> = ({ currentValue }) => {
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    // Initialize chart data with historical values (starting at 1 million)
    if (chartData.length === 0) {
      const initialData = [];
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
      
      // Create data points from 1 million to the current value
      const intervals = 24; // One data point per hour
      for (let i = 0; i <= intervals; i++) {
        const pointDate = new Date(startDate.getTime() + ((endDate.getTime() - startDate.getTime()) * (i / intervals)));
        
        // Linear interpolation from 1 million to current value
        const value = 1000000 + ((currentValue - 1000000) * (i / intervals));
        
        initialData.push({
          time: pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(value)
        });
      }
      
      setChartData(initialData);
    } else {
      // Add new data point with current value
      const now = new Date();
      const newTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Check if we should update the last point or add a new one
      const lastPoint = chartData[chartData.length - 1];
      if (lastPoint.time === newTimeStr) {
        // Update the last point
        const updatedData = [...chartData];
        updatedData[updatedData.length - 1] = { ...lastPoint, value: currentValue };
        setChartData(updatedData);
      } else {
        // Add a new point and remove oldest if more than 25 points
        const newData = [...chartData, { time: newTimeStr, value: currentValue }];
        if (newData.length > 25) {
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
          
          <div className="flex-1 mt-2">
            <h3 className="text-sm font-medium mb-2">Total USD Value Unlocked (24h)</h3>
            <div className="h-[140px]">
              <ChartContainer 
                config={{
                  value: {
                    theme: {
                      light: "#8B5CF6",
                      dark: "#8B5CF6"
                    }
                  }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      tickCount={5}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={value => `$${value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString()}`}
                    />
                    <Tooltip 
                      content={({ active, payload }) => 
                        active && payload && payload.length ? (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-medium">{payload[0].payload.time}</div>
                            <div className="text-muted-foreground">{formatCurrency(payload[0].value as number)}</div>
                          </div>
                        ) : null
                      }
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8B5CF6" 
                      fillOpacity={1} 
                      fill="url(#valueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumIntro;
