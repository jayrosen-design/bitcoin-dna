
import React from 'react';
import { SeedPhrase } from './QuantumSeedSimulation';

interface PhrasesTableProps {
  phrases: SeedPhrase[];
}

export const PhrasesTable: React.FC<PhrasesTableProps> = ({ phrases }) => {
  // Create a pixel graphic based on 12 selected words
  const createPixelGraphic = (visualData: number[]) => {
    const pixelContainer = document.createElement('div');
    pixelContainer.className = 'pixel-graphic';
    pixelContainer.style.display = 'grid';
    pixelContainer.style.gridTemplateColumns = 'repeat(3, 8px)';
    pixelContainer.style.gridTemplateRows = 'repeat(4, 8px)';
    pixelContainer.style.gap = '1px';
    pixelContainer.style.marginRight = '10px';
    
    // Calculate color based on grid position
    const calculateColor = (index: number) => {
      const gridSize = 45; // Match with matrix grid size
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Calculate RGB components based on position
      const r = Math.floor((col / gridSize) * 180) + 30;
      const g = Math.floor((row / gridSize) * 180) + 30;
      const b = Math.floor(((row / gridSize + col / gridSize) / 2) * 180) + 30;
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    // Create 12 pixels based on the selected indices
    visualData.forEach(index => {
      const pixel = document.createElement('div');
      pixel.className = 'pixel';
      pixel.style.width = '8px';
      pixel.style.height = '8px';
      pixel.style.borderRadius = '1px';
      pixel.style.backgroundColor = calculateColor(index);
      pixelContainer.appendChild(pixel);
    });
    
    return pixelContainer;
  };

  return (
    <div className="p-4">
      <div className="mb-3 border-b border-gray-800 pb-2">
        <h3 className="text-cyan-500 text-lg font-semibold">Generated Seed Phrases</h3>
        <p className="text-gray-500 text-sm">History of attempted 12-word combinations</p>
      </div>
      
      <div className="h-[calc(100%-80px)] overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 pr-2 text-cyan-600 text-sm">#</th>
              <th className="py-2 pr-4 text-cyan-600 text-sm">Visual</th>
              <th className="py-2 text-cyan-600 text-sm">Seed Phrase</th>
            </tr>
          </thead>
          <tbody>
            {phrases.map((phrase, index) => (
              <tr key={phrase.id} className="border-t border-gray-800">
                <td className="py-2 pr-2 text-gray-400 text-sm align-top">
                  {phrases.length - index}
                </td>
                <td className="py-2 pr-4 align-top">
                  <div 
                    ref={el => {
                      if (el) {
                        el.innerHTML = '';
                        el.appendChild(createPixelGraphic(phrase.visualData));
                      }
                    }}
                  />
                </td>
                <td className="py-2 text-gray-400 text-xs align-top">
                  {phrase.words.join(' ')}
                  <div className="text-gray-600 text-xs mt-1">
                    {phrase.btcAddress}
                  </div>
                </td>
              </tr>
            ))}
            {phrases.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No phrases generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
