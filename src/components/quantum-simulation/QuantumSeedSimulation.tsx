
import React, { useState, useEffect } from 'react';
import { PhrasesTable } from './PhrasesTable';
import { QuantumMatrix2D } from './QuantumMatrix2D';
import { QuantumMatrix3D } from './QuantumMatrix3D';
import { Button } from '@/components/ui/button';
import { useQuantumSimulation, SeedPhrase } from '@/hooks/useQuantumSimulation';
import { PanelLeft } from 'lucide-react';

export interface QuantumSeedSimulationProps {
  // Props can be added here if needed
}

export { type SeedPhrase };

export const QuantumSeedSimulation: React.FC<QuantumSeedSimulationProps> = () => {
  const [view, setView] = useState<'2D' | '3D'>('2D');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showConnections, setShowConnections] = useState(false);
  const { currentPhrase, iterations, combinations, phrases, generateRandomSeedPhrase } = useQuantumSimulation();
  const [currentIndices, setCurrentIndices] = useState<number[]>([]);
  
  // Initialize with first random seed phrase
  useEffect(() => {
    const { selectedIndices } = generateRandomSeedPhrase();
    setCurrentIndices(selectedIndices);
    
    // Setup interval for generating new phrases
    const intervalId = setInterval(() => {
      const { selectedIndices } = generateRandomSeedPhrase();
      setCurrentIndices(selectedIndices);
    }, 1000); // Generate a new phrase every second
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="w-full h-full bg-[#0a0a0a] flex">
      {/* Sidebar with phrases history */}
      <div 
        className={`h-full overflow-hidden border-r border-gray-800 transition-all duration-300 ${
          showSidebar ? 'w-[350px]' : 'w-0'
        }`}
      >
        {showSidebar && (
          <PhrasesTable 
            phrases={phrases} 
            showConnections={showConnections} 
            setShowConnections={setShowConnections}
          />
        )}
      </div>
      
      {/* Main visualization area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Controls */}
        <div className="p-2 flex justify-between items-center bg-[#111] border-b border-gray-800">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={view === '2D' ? 'default' : 'outline'} 
              onClick={() => setView('2D')}
            >
              2D View
            </Button>
            <Button 
              size="sm" 
              variant={view === '3D' ? 'default' : 'outline'} 
              onClick={() => setView('3D')}
            >
              3D View
            </Button>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <PanelLeft className={`h-5 w-5 transition-transform ${!showSidebar ? 'rotate-180' : ''}`} />
            {showSidebar ? 'Hide' : 'Show'} History
          </Button>
        </div>
        
        {/* Visualization container */}
        <div className="flex-1 overflow-hidden relative">
          {/* 2D View */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${view === '2D' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <QuantumMatrix2D 
              showConnections={showConnections}
              currentPhrase={currentPhrase}
              currentIndices={currentIndices}
            />
          </div>
          
          {/* 3D View */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${view === '3D' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <QuantumMatrix3D 
              showConnections={showConnections}
              currentPhrase={currentPhrase}
              currentIndices={currentIndices}
            />
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="p-2 flex justify-between items-center text-xs text-cyan-400 bg-[#0a0a0a] border-t border-gray-800">
          <div>Iterations: {iterations.toLocaleString()}</div>
          <div className="truncate mx-4 text-center font-mono">
            Current: {currentPhrase.join(' ').substring(0, 60)}{currentPhrase.join(' ').length > 60 ? '...' : ''}
          </div>
          <div>Combinations: {combinations.toLocaleString()} of 5.44 × 10^39</div>
        </div>
      </div>
    </div>
  );
};
