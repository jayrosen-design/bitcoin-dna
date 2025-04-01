
import React from 'react';
import { SeedPhrase } from '@/hooks/useQuantumSimulation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PhrasesTableProps {
  phrases: SeedPhrase[];
  showConnections: boolean;
  setShowConnections: (show: boolean) => void;
}

export const PhrasesTable: React.FC<PhrasesTableProps> = ({ 
  phrases, 
  showConnections, 
  setShowConnections 
}) => {
  // Create a pixel graphic based on 12 selected words
  const createPixelGraphic = (indices: number[]) => {
    const gridSize = Math.ceil(Math.sqrt(2048)); // For 2048 words
    
    // Function to calculate color based on position in grid
    const calculateColor = (index: number) => {
      // Determine position in a virtual square grid
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Calculate normalized positions (0 to 1)
      const normalizedRow = row / gridSize;
      const normalizedCol = col / gridSize;
      
      // Create RGB components based on position
      const r = Math.floor(100 + normalizedCol * 155); // range from 100-255
      const g = Math.floor(100 + normalizedRow * 155); // range from 100-255
      const b = Math.floor(150 + ((normalizedRow + normalizedCol) / 2) * 100); // range from 150-250
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    return (
      <div className="grid grid-cols-3 grid-rows-4 gap-px">
        {indices.map((index, i) => (
          <div 
            key={i} 
            className="w-2 h-2 rounded-sm" 
            style={{ backgroundColor: calculateColor(index) }}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-gray-300">
      <div className="p-2 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-cyan-400 mb-1">Generated Seed Phrases</h2>
        <p className="text-xs text-gray-400">History of attempted 12-word combinations</p>
      </div>
      
      {/* Toggle switch for connections */}
      <div className="p-2 border-b border-gray-800 flex items-center">
        <Switch 
          id="show-connections" 
          checked={showConnections}
          onCheckedChange={setShowConnections}
          className="mr-2"
        />
        <Label htmlFor="show-connections" className="text-sm">Show Word Connections</Label>
      </div>
      
      {/* Phrases table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-2 text-left text-xs">#</th>
              <th className="p-2 text-left text-xs">Visual</th>
              <th className="p-2 text-left text-xs">Seed Phrase / Address</th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((phrase, index) => (
              <React.Fragment key={phrase.id}>
                <tr className="border-b border-gray-800">
                  <td className="p-2 text-xs align-top">{index + 1}</td>
                  <td className="p-2 align-top">
                    {createPixelGraphic(phrase.visualData)}
                  </td>
                  <td className="p-2">
                    {/* Show BTC address above the words */}
                    <div className="text-xs text-cyan-500 font-mono mb-1 break-all">
                      {phrase.address}
                    </div>
                    <div className="text-xs break-words">
                      {phrase.words.join(' ')}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
