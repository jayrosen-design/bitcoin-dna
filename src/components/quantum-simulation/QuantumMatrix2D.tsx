
import React, { useEffect, useRef } from 'react';
import { wordList } from '@/utils/wordList';

interface QuantumMatrix2DProps {
  showConnections: boolean;
  currentPhrase: string[];
  currentIndices: number[];
}

export const QuantumMatrix2D: React.FC<QuantumMatrix2DProps> = ({ 
  showConnections, 
  currentPhrase,
  currentIndices
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize word refs array once
  useEffect(() => {
    wordsRef.current = Array(wordList.length).fill(null);
  }, []);
  
  // Calculate color based on position in grid - smoother gradient
  const calculateColor = (index: number) => {
    const gridSize = 45;  // Fixed grid size for better layout
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    // Calculate normalized positions (0 to 1)
    const normalizedRow = row / gridSize;
    const normalizedCol = col / gridSize;
    
    // Create RGB components based on position with smoother gradients
    const r = Math.floor(60 + normalizedCol * 195); // range from 60-255
    const g = Math.floor(60 + normalizedRow * 195); // range from 60-255
    const b = Math.floor(100 + ((normalizedRow + normalizedCol) / 2) * 155); // range from 100-255
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Draw connections between active words
  useEffect(() => {
    if (!showConnections || !canvasRef.current || currentIndices.length === 0 || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update canvas dimensions to match container
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Draw connections
    if (wordsRef.current.length > 0) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < currentIndices.length - 1; i++) {
        const wordElem1 = wordsRef.current[currentIndices[i]];
        const wordElem2 = wordsRef.current[currentIndices[i + 1]];
        
        if (wordElem1 && wordElem2) {
          const rect1 = wordElem1.getBoundingClientRect();
          const rect2 = wordElem2.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          
          const x1 = rect1.left + rect1.width / 2 - containerRect.left;
          const y1 = rect1.top + rect1.height / 2 - containerRect.top;
          const x2 = rect2.left + rect2.width / 2 - containerRect.left;
          const y2 = rect2.top + rect2.height / 2 - containerRect.top;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
      
      // Connect last word to first word to complete the loop
      const firstWordElem = wordsRef.current[currentIndices[0]];
      const lastWordElem = wordsRef.current[currentIndices[currentIndices.length - 1]];
      
      if (firstWordElem && lastWordElem) {
        const rect1 = firstWordElem.getBoundingClientRect();
        const rect2 = lastWordElem.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        
        const x1 = rect1.left + rect1.width / 2 - containerRect.left;
        const y1 = rect1.top + rect1.height / 2 - containerRect.top;
        const x2 = rect2.left + rect2.width / 2 - containerRect.left;
        const y2 = rect2.top + rect2.height / 2 - containerRect.top;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }, [showConnections, currentIndices]);
  
  // Update word references and connections when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (showConnections && canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showConnections]);
  
  // Set word references
  const setWordRef = (el: HTMLDivElement | null, index: number) => {
    if (index >= 0 && index < wordsRef.current.length) {
      wordsRef.current[index] = el;
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#0a0a0a] relative flex items-center justify-center overflow-auto p-1"
    >
      {/* Canvas for drawing connections */}
      {showConnections && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-none z-10"
        />
      )}
      
      {/* Word grid - using fixed dimensions that allow all words to be visible */}
      <div 
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(45, minmax(20px, 1fr))',
          gap: '1px',
          width: '100%',
          height: '100%',
          minWidth: '1350px', // Ensure grid is wide enough for all words
          minHeight: '900px',  // Ensure grid is tall enough
        }}
      >
        {wordList.map((word, index) => {
          const isActive = currentIndices.includes(index);
          const baseColor = calculateColor(index);
          
          // Calculate a brighter version for active words
          let textColor = baseColor;
          let borderColor = baseColor;
          
          if (isActive) {
            // Parse RGB values for creating a brighter version
            const rgb = baseColor.match(/\d+/g)?.map(Number) || [100, 100, 100];
            // Create a brighter version for active state
            textColor = `rgb(${Math.min(255, rgb[0] + 100)}, ${Math.min(255, rgb[1] + 100)}, ${Math.min(255, rgb[2] + 100)})`;
          }
          
          return (
            <div
              key={index}
              ref={(el) => setWordRef(el, index)}
              className={`flex items-center justify-center text-center rounded-sm bg-[#1a1a1a] border-[0.5px] p-0.5 transition-all duration-300 overflow-hidden ${
                isActive ? 'animate-pulse font-bold z-20' : ''
              }`}
              style={{ 
                color: textColor,
                borderColor: borderColor,
                textShadow: isActive ? `0 0 5px ${textColor}, 0 0 10px ${textColor}` : 'none',
                fontSize: '6px',
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
    </div>
  );
};
