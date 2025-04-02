
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Toggle } from '@/components/ui/toggle';
import { SeedPhrase } from './QuantumSeedSimulation';

interface PhrasePixelProps {
  colors: number[];
  visualData: number[]; // Word indices to get accurate colors
}

const PhrasePixel: React.FC<PhrasePixelProps> = ({ colors, visualData }) => {
  // Function to calculate color based on index with smoother gradient
  const calculateColor = (index: number) => {
    const row = Math.floor(index / 45);
    const col = index % 45;
    
    // Calculate normalized positions (0 to 1)
    const normalizedRow = row / 45;
    const normalizedCol = col / 45;
    
    // Create smoother gradient using HSL
    const hue = (normalizedCol * 180 + normalizedRow * 180) % 360;
    const saturation = 70 + Math.sin(normalizedRow * Math.PI) * 20;
    const lightness = 35 + Math.cos(normalizedCol * Math.PI) * 15;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-[1px]">
      {colors.map((_, i) => {
        // Use the actual word index from visualData to get the correct color
        const wordIndex = visualData[i];
        return (
          <div 
            key={i} 
            className="w-2 h-2 rounded-[1px]" 
            style={{ backgroundColor: calculateColor(wordIndex) }}
          />
        );
      })}
    </div>
  );
};

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
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-cyan-500 text-lg font-medium">Generated Seed Phrases</h2>
        <p className="text-xs text-gray-500">History of attempted 12-word combinations</p>
      </div>
      
      {/* Toggle for connections */}
      <div className="px-3 py-2 border-b border-gray-700 flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Show Word Connections</span>
          <Toggle
            pressed={showConnections}
            onPressedChange={setShowConnections}
            variant="outline"
            size="sm"
            className="h-6 w-10 rounded-full bg-slate-900 border-cyan-800 data-[state=on]:bg-cyan-900 data-[state=on]:border-cyan-400"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-16">Visual</TableHead>
              <TableHead>Seed Phrase & Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phrases.map((phrase) => (
              <TableRow key={phrase.id}>
                <TableCell className="text-xs">{phrases.indexOf(phrase) + 1}</TableCell>
                <TableCell>
                  <PhrasePixel colors={phrase.visualData} visualData={phrase.visualData} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-cyan-500 font-mono mb-1 break-all">
                      {phrase.btcAddress}
                    </span>
                    <span className="text-xs">
                      {phrase.words.join(' ')}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
