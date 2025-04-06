
import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';

const DNAVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seedPhrase, setSeedPhrase] = useState("wonder decade spirit token flame hawk screen behind enable gun dignity pill");
  const [address, setAddress] = useState("18Zc5bhBCnovk2pxDzqz5bMcMhrYtkJ11M");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Animation parameters
    let frame = 0;
    const strands = 2;
    const particles = 30;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Color derived from seed phrase (just for demo)
    const colors = [
      '#3498db', '#9b59b6', '#2ecc71', '#f1c40f', 
      '#e74c3c', '#1abc9c', '#34495e', '#e67e22'
    ];

    // Utility function to get pseudo-random value based on seed and position
    const getRandomValue = (seed: string, pos: number) => {
      const hash = seed.charCodeAt(pos % seed.length) / 255;
      return hash;
    };

    // Animation loop
    const drawDNA = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update frame counter
      frame += 0.5;
      
      // Draw DNA strands
      for (let strand = 0; strand < strands; strand++) {
        const strandOffset = (strand * Math.PI) / strands;
        
        // Draw base pairs and helices
        for (let i = 0; i < particles; i++) {
          const percent = i / particles;
          const theta = percent * Math.PI * 4 + frame * 0.03;
          
          // Calculate helix positions
          const hx1 = centerX + Math.cos(theta + strandOffset) * radius;
          const hy1 = centerY + percent * canvas.height * 0.8 - canvas.height * 0.4;
          
          const hx2 = centerX + Math.cos(theta + strandOffset + Math.PI) * radius;
          const hy2 = hy1;
          
          // Determine color based on seed phrase
          const colorIndex = Math.floor(getRandomValue(seedPhrase, i) * colors.length);
          const color = colors[colorIndex];
          
          // Draw base pairs
          ctx.beginPath();
          ctx.moveTo(hx1, hy1);
          ctx.lineTo(hx2, hy2);
          ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
          ctx.stroke();
          
          // Draw helix nodes
          ctx.beginPath();
          ctx.arc(hx1, hy1, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(hx2, hy2, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      
      requestAnimationFrame(drawDNA);
    };
    
    // Start animation
    drawDNA();
    
    // Cleanup
    return () => {
      // Any cleanup needed
    };
  }, [seedPhrase]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Live DNA Visualization</h2>
      
      <Card className="w-full max-w-4xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="aspect-video relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full absolute top-0 left-0"
          ></canvas>
        </div>
        
        <div className="p-4 bg-black/40">
          <div className="mb-3">
            <div className="text-sm text-gray-400 mb-1">Seed Phrase:</div>
            <div className="text-white font-mono text-sm bg-black/30 p-2 rounded-md overflow-x-auto">
              {seedPhrase}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-1">Bitcoin Address:</div>
            <div className="text-white font-mono text-sm bg-black/30 p-2 rounded-md overflow-x-auto">
              {address}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DNAVisualizer;
