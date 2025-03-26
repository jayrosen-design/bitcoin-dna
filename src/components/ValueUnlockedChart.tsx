
import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface ValueUnlockedChartProps {
  chartData: { time: string; value: number }[];
  formatCurrency: (value: number) => string;
}

const ValueUnlockedChart: React.FC<ValueUnlockedChartProps> = ({ chartData, formatCurrency }) => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-medium mb-2">Total USD Value Unlocked (Weekly)</h3>
      <div className="flex-grow" style={{ height: "180px" }}>
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
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
  );
};

export default ValueUnlockedChart;
