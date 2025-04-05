
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
  const wordElementsRef = useRef<HTMLDivElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate color based on position in grid - using a simpler gradient closer to the original HTML
  const calculateColor = (row: number, col: number, gridSize: number) => {
    // Calculate normalized positions (0 to 1)
    const normalizedRow = row / gridSize;
    const normalizedCol = col / gridSize;
    
    // Create RGB components based on position similar to HTML example
    const r = Math.floor(normalizedCol * 180) + 30;
    const g = Math.floor(normalizedRow * 180) + 30;
    const b = Math.floor(((normalizedRow + normalizedCol) / 2) * 180) + 30;
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Initialize the grid
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Calculate the grid dimensions for a square-ish layout to fit all 2048 words
    const gridSize = Math.ceil(Math.sqrt(wordList.length));
    const wordElements: HTMLDivElement[] = [];
    
    // Create grid container
    const gridElement = document.createElement('div');
    gridElement.className = 'word-grid';
    gridElement.style.display = 'grid';
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridElement.style.gap = '2px';
    gridElement.style.width = '100%';
    gridElement.style.height = '100%';
    gridElement.style.overflow = 'hidden';
    gridElement.style.padding = '10px';
    
    // Create all word elements
    wordList.forEach((word, index) => {
      const wordElement = document.createElement('div');
      wordElement.className = 'word';
      wordElement.textContent = word;
      wordElement.dataset.index = index.toString();
      
      // Calculate position in grid
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Apply position-based color
      const baseColor = calculateColor(row, col, gridSize);
      wordElement.style.color = baseColor;
      wordElement.style.borderColor = baseColor;
      wordElement.style.fontSize = '8px';
      wordElement.style.padding = '2px';
      wordElement.style.textAlign = 'center';
      wordElement.style.borderRadius = '2px';
      wordElement.style.backgroundColor = 'rgba(0,0,0,0.2)';
      wordElement.style.overflow = 'hidden';
      wordElement.style.whiteSpace = 'nowrap';
      wordElement.style.textOverflow = 'ellipsis';
      
      gridElement.appendChild(wordElement);
      wordElements.push(wordElement);
    });
    
    container.appendChild(gridElement);
    wordElementsRef.current = wordElements;
    
    // Initial highlight of active words
    highlightActiveWords();
  }, []);
  
  // Highlight active words effect
  const highlightActiveWords = () => {
    const wordElements = wordElementsRef.current;
    
    // Reset all words first
    wordElements.forEach(element => {
      const index = parseInt(element.dataset.index || '0', 10);
      const row = Math.floor(index / Math.ceil(Math.sqrt(wordList.length)));
      const col = index % Math.ceil(Math.sqrt(wordList.length));
      const baseColor = calculateColor(row, col, Math.ceil(Math.sqrt(wordList.length)));
      
      element.style.color = baseColor;
      element.style.textShadow = 'none';
      element.style.fontWeight = 'normal';
      element.style.backgroundColor = 'rgba(0,0,0,0.2)';
    });
    
    // Highlight active words
    currentIndices.forEach(index => {
      if (index >= 0 && index < wordElements.length) {
        const element = wordElements[index];
        if (element) {
          // Enhanced visibility for active words
          const row = Math.floor(index / Math.ceil(Math.sqrt(wordList.length)));
          const col = index % Math.ceil(Math.sqrt(wordList.length));
          const baseColor = calculateColor(row, col, Math.ceil(Math.sqrt(wordList.length)));
          
          // Calculate brighter color for active state
          const rgb = baseColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
          const brightColor = `rgb(${Math.min(255, rgb[0] + 100)}, ${Math.min(255, rgb[1] + 100)}, ${Math.min(255, rgb[2] + 100)})`;
          
          element.style.color = brightColor;
          element.style.textShadow = `0 0 5px ${brightColor}, 0 0 10px ${brightColor}`;
          element.style.fontWeight = 'bold';
          element.style.backgroundColor = 'rgba(0,0,0,0.5)';
        }
      }
    });
    
    // Clear and recreate connections if enabled
    clearConnections();
    
    // Only draw connections if explicitly enabled
    if (showConnections && currentIndices.length > 0) {
      drawConnections();
    }
  };
  
  // Clear any existing connections
  const clearConnections = () => {
    if (!containerRef.current) return;
    
    // Remove any existing canvas
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
  };
  
  // Draw connections between active words
  const drawConnections = () => {
    if (!containerRef.current) return;
    
    clearConnections();
    
    const container = containerRef.current;
    const wordElements = wordElementsRef.current;
    const gridElement = container.querySelector('.word-grid') as HTMLDivElement;
    
    if (!gridElement || currentIndices.length < 2) return;
    
    // Create canvas for drawing connections
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);
    canvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Collect positions of active words
    const positions: {x: number, y: number}[] = [];
    
    currentIndices.forEach(index => {
      if (index >= 0 && index < wordElements.length) {
        const element = wordElements[index];
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          positions.push({
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top
          });
        }
      }
    });
    
    // Draw connections
    // Changed from cyan to bitcoin orange
    ctx.strokeStyle = 'rgba(247, 147, 26, 0.3)'; // Bitcoin orange with opacity
    ctx.lineWidth = 1;
    
    for (let i = 0; i < positions.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(positions[i].x, positions[i].y);
      ctx.lineTo(positions[i + 1].x, positions[i + 1].y);
      ctx.stroke();
    }
    
    // Connect last to first to complete the loop
    if (positions.length > 2) {
      ctx.beginPath();
      ctx.moveTo(positions[positions.length - 1].x, positions[positions.length - 1].y);
      ctx.lineTo(positions[0].x, positions[0].y);
      ctx.stroke();
    }
  };
  
  // Update highlights when current indices change
  useEffect(() => {
    highlightActiveWords();
  }, [currentIndices, showConnections]);
  
  // Update connections on window resize
  useEffect(() => {
    const handleResize = () => {
      if (showConnections) {
        drawConnections();
      } else {
        clearConnections();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showConnections, currentIndices]);
  
  return (
    <div ref={containerRef} className="w-full h-full relative" />
  );
};
