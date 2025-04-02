
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { wordList } from '@/utils/wordList';
import { QuantumMatrix2D } from './QuantumMatrix2D';
import { QuantumMatrix3D } from './QuantumMatrix3D';
import { PhrasesTable } from './PhrasesTable';
import { generateRandomTaprootAddress } from '@/utils/cryptoUtils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface SeedPhrase {
  id: number;
  words: string[];
  visualData: number[];
  btcAddress: string;
}

export const QuantumSeedSimulation: React.FC = () => {
  const [view, setView] = useState<'2D' | '3D'>('2D');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConnections, setShowConnections] = useState(true); // Default to true
  const [iterations, setIterations] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState<string[]>([]);
  const [combinations, setCombinations] = useState(0);
  const [phrases, setPhrases] = useState<SeedPhrase[]>([]);
  const firstRenderRef = useRef(true);
  
  // Generate a random seed phrase (12 words)
  const generateRandomSeedPhrase = () => {
    const selectedIndices: number[] = [];
    const selectedWords: string[] = [];
    
    while (selectedIndices.length < 12) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      if (!selectedIndices.includes(randomIndex)) {
        selectedIndices.push(randomIndex);
        selectedWords.push(wordList[randomIndex]);
      }
    }
    
    setCurrentPhrase(selectedWords);
    setIterations(prev => prev + 1);
    setCombinations(prev => prev + 1);
    
    // Generate random BTC Taproot address
    const taprootAddress = generateRandomTaprootAddress();
    
    // Add to phrases history (limited to 100)
    const newPhrase: SeedPhrase = {
      id: Date.now(),
      words: selectedWords,
      visualData: selectedIndices,
      btcAddress: taprootAddress
    };
    
    setPhrases(prev => {
      const updated = [newPhrase, ...prev];
      if (updated.length > 100) {
        return updated.slice(0, 100);
      }
      return updated;
    });
  };
  
  // Handle view change with proper initialization
  const handleViewChange = (newView: '2D' | '3D') => {
    setView(newView);
    
    // When switching to 3D view, force a small timeout to ensure proper rendering
    if (newView === '3D') {
      // Force a re-render of the component after a short delay
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  };
  
  // Start generating phrases on component mount
  useEffect(() => {
    generateRandomSeedPhrase();
    
    const interval = setInterval(() => {
      generateRandomSeedPhrase();
    }, 1500);
    
    // Handle initial render
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      
      // Pre-render both views
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black text-gray-400 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between bg-black p-3 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleViewChange('2D')}
              variant={view === '2D' ? 'default' : 'outline'}
              size="sm"
              className="h-8"
            >
              2D View
            </Button>
            <Button 
              onClick={() => handleViewChange('3D')}
              variant={view === '3D' ? 'default' : 'outline'}
              size="sm"
              className="h-8"
            >
              3D View
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-connections" 
              checked={showConnections} 
              onCheckedChange={setShowConnections}
              className="data-[state=checked]:bg-cyan-600"
            />
            <Label htmlFor="show-connections" className="text-cyan-300 text-sm">
              Word Connections
            </Label>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-8"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100% - 76px)" }}>
        {/* Phrases sidebar */}
        <div className={`bg-[#0a0a0a] border-r border-gray-800 transition-all duration-300 ${
          sidebarOpen ? 'w-2/5 md:w-1/3 lg:w-1/4' : 'w-0'
        } overflow-auto`}>
          {sidebarOpen && (
            <PhrasesTable 
              phrases={phrases} 
              setShowConnections={setShowConnections} 
              showConnections={showConnections}
            />
          )}
        </div>
        
        {/* Visualization container */}
        <div className="flex-1 relative">
          {/* Render both views but hide one based on state */}
          <div className={`absolute inset-0 ${view === '2D' ? 'block' : 'hidden'}`}>
            <QuantumMatrix2D 
              showConnections={showConnections} 
              currentPhrase={currentPhrase}
              currentIndices={phrases[0]?.visualData || []}
            />
          </div>
          <div className={`absolute inset-0 ${view === '3D' ? 'block' : 'hidden'}`}>
            <QuantumMatrix3D 
              showConnections={showConnections}
              currentPhrase={currentPhrase}
              currentIndices={phrases[0]?.visualData || []}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-black text-cyan-500 border-t border-gray-800 px-4 py-2 flex justify-between text-sm">
        <div>Iterations: {iterations.toLocaleString()}</div>
        <div>Current attempt: {currentPhrase.slice(0, 3).join(" ")}...</div>
        <div>Combinations: {combinations.toLocaleString()} of 5.44 × 10^39</div>
      </div>
    </div>
  );
};
