
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { SeedPhrase } from './QuantumSeedSimulation';

interface PhrasePixelProps {
  colors: number[];
}

const PhrasePixel: React.FC<PhrasePixelProps> = ({ colors }) => {
  // Function to calculate color based on index
  const calculateColor = (index: number) => {
    const row = Math.floor(index / 45);
    const col = index % 45;
    
    // Calculate normalized positions (0 to 1)
    const normalizedRow = row / 45;
    const normalizedCol = col / 45;
    
    // Create RGB components based on position
    const r = Math.floor(normalizedCol * 180) + 30;
    const g = Math.floor(normalizedRow * 180) + 30;
    const b = Math.floor(((normalizedRow + normalizedCol) / 2) * 180) + 30;
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-[1px]">
      {colors.map((index, i) => (
        <div 
          key={i} 
          className="w-2 h-2 rounded-[1px]" 
          style={{ backgroundColor: calculateColor(index) }}
        />
      ))}
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
      
      <div className="flex-1 overflow-y-auto p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-16">Visual</TableHead>
              <TableHead>12-Word Seed Phrase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phrases.map((phrase) => (
              <TableRow key={phrase.id}>
                <TableCell className="text-xs">{phrases.indexOf(phrase) + 1}</TableCell>
                <TableCell>
                  <PhrasePixel colors={phrase.visualData} />
                </TableCell>
                <TableCell className="text-xs">
                  {phrase.words.join(' ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-3 border-t border-gray-700 bg-[#111]">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="showConnections" 
            checked={showConnections}
            onCheckedChange={(checked) => setShowConnections(!!checked)} 
          />
          <label htmlFor="showConnections" className="text-sm">
            Show Word Connections
          </label>
        </div>
      </div>
    </div>
  );
};
