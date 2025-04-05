import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dna, Upload, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BitcoinSeed {
  name: string;
  description: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

// Define COLORS similar to the original code
const COLORS: Record<string, { hex: string }> = {
  "red": { "hex": "#8B0000" },      // Dark red
  "orange": { "hex": "#FF8C00" },   // Dark orange
  "yellow": { "hex": "#FFD700" },   // Gold yellow
  "green": { "hex": "#006400" },    // Dark green
  "blue": { "hex": "#00008B" },     // Dark blue
  "indigo": { "hex": "#4B0082" },   // Indigo
  "violet": { "hex": "#800080" },   // Purple/Violet
  "brown": { "hex": "#8B4513" },    // Brown
  "black": { "hex": "#000000" },    // Black
  "gray": { "hex": "#2F4F4F" },     // Dark Gray
  "silver": { "hex": "#708090" },   // Silver
  "gold": { "hex": "#B8860B" }      // Gold
};

// Animation styles
const ANIMATION_STYLES = ['rotate', 'flow', 'combined', 'pulse'];

const BtcDna = () => {
  const [selectedSeed, setSelectedSeed] = useState<BitcoinSeed | null>(null);
  const [exampleSeed, setExampleSeed] = useState<BitcoinSeed | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('No file selected');
  
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const exampleCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const mainAnimationRef = useRef<number | null>(null);
  const exampleAnimationRef = useRef<number | null>(null);
  
  const animationPhaseRef = useRef(0);
  const animationFlowOffsetRef = useRef(0);
  const exampleAnimationPhaseRef = useRef(0);
  const exampleAnimationFlowOffsetRef = useRef(0);
  
  // Example Bitcoin Seeds (would come from knowledgebase)
  const bitcoinSeeds: BitcoinSeed[] = [
    {
      "name": "Bitcoin Seed #59",
      "description": "A unique Bitcoin seed phrase with its associated wallet address and private key.",
      "attributes": [
        {
          "trait_type": "Bitcoin Address",
          "value": "1NYZLFcgtUyEY2qysiW9AYcBxmpskJJYHz"
        },
        {
          "trait_type": "Private Key",
          "value": "c7ba9a42506bcece148e3293189906cdf8ddd509ceb58e2059e10b508cc4ebe2"
        },
        {
          "trait_type": "Seed Phrase",
          "value": "rotate trumpet metal tape detect suffer invest unusual rather sound hip execute"
        },
        {
          "trait_type": "Background Color",
          "value": "red"
        },
        {
          "trait_type": "Primary Hash",
          "value": "2d9df1a1efb7b791ed7a621a2ac81ce4ba8e2357d18b2fd247659bc8e1352782"
        },
        {
          "trait_type": "Secondary Hash",
          "value": "67f8fac45e265f82b7aa887ba0f5f3c9aa2a092fee2d55890e68adb7315c4f8a92c0259882eb677526518203f1bb19c0a56a41df070f52addc3d5dcd17699050"
        }
      ]
    }
  ];
  
  // Show error message
  const showError = (message: string) => {
    toast.error(message);
  };

  // Get random animation style
  const getRandomAnimationStyle = useCallback(() => {
    return ANIMATION_STYLES[Math.floor(Math.random() * ANIMATION_STYLES.length)];
  }, []);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadedFileName('No file selected');
      return;
    }
    
    setUploadedFileName(file.name);
  };
  
  // Process JSON file
  const handleProcessJson = () => {
    const fileInput = document.getElementById('jsonFileInput') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      showError('Please select a JSON file.');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string) as BitcoinSeed;
        setSelectedSeed(jsonData);
        toast.success(`Loaded ${jsonData.name}`);
      } catch (error) {
        showError('Invalid JSON format.');
        console.error(error);
      }
    };
    
    reader.onerror = () => {
      showError('Failed to read the file.');
    };
    
    reader.readAsText(file);
  };
  
  // Download animation as PNG (simplified version)
  const downloadAnimation = () => {
    if (!selectedSeed || !mainCanvasRef.current) return;
    
    setIsDownloading(true);
    toast.info("Preparing download...");
    
    setTimeout(() => {
      if (mainCanvasRef.current) {
        // In a real app, we would create a GIF here
        // For simplicity, we'll just download the current canvas image
        const link = document.createElement('a');
        link.download = `bitcoin-seed-${selectedSeed.name.replace(/\s+/g, '-')}.png`;
        link.href = mainCanvasRef.current.toDataURL('image/png');
        link.click();
      }
      setIsDownloading(false);
      toast.success("Animation downloaded!");
    }, 1500);
  };
  
  // Create a seeded random number generator
  const createSeededRandom = (seed: string) => {
    let m_w = 123456789;
    let m_z = 987654321;
    
    // Hash the seed to get initial values
    for (let i = 0; i < seed.length; i++) {
      m_w = (36969 * (m_w & 65535) + (m_w >> 16)) ^ seed.charCodeAt(i);
      m_z = (18000 * (m_z & 65535) + (m_z >> 16)) ^ seed.charCodeAt(i);
    }
    
    return function() {
      m_z = (36969 * (m_z & 65535) + (m_z >> 16));
      m_w = (18000 * (m_w & 65535) + (m_w >> 16));
      const result = ((m_z << 16) + m_w) & 0xFFFFFFFF;
      return (result / 4294967296) + 0.5;
    };
  };
  
  // Helper to get attribute value from JSON
  const getAttributeValue = (jsonData: BitcoinSeed | null, traitType: string) => {
    if (!jsonData?.attributes) return null;
    
    const attribute = jsonData.attributes.find(attr => 
      attr.trait_type === traitType
    );
    
    return attribute ? attribute.value : null;
  };
  
  // Helper to convert hex color to RGB
  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return { r, g, b };
  };
  
  // Render the DNA visualization frame for the main canvas
  const renderDnaFrame = (seed: BitcoinSeed, canvas: HTMLCanvasElement, animationType: string, phase: number, flowOffset: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Get necessary values from JSON
    const seedPhrase = getAttributeValue(seed, 'Seed Phrase');
    const privateKey = getAttributeValue(seed, 'Private Key');
    const bgColor = getAttributeValue(seed, 'Background Color');
    const primaryHash = getAttributeValue(seed, 'Primary Hash');
    const secondaryHash = getAttributeValue(seed, 'Secondary Hash');
    
    if (!seedPhrase || !privateKey || !bgColor || !primaryHash || !secondaryHash) {
      showError('Required attributes missing from JSON data.');
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background color
    const bgColorHex = COLORS[bgColor as keyof typeof COLORS]?.hex || '#2F4F4F'; // Default to gray if color not found
    ctx.fillStyle = bgColorHex;
    ctx.fillRect(0, 0, width, height);
    
    // Create ASCII art canvas
    const charWidth = canvas === exampleCanvasRef.current ? 120 : 240;
    const charHeight = canvas === exampleCanvasRef.current ? 60 : 120;
    const dnaCanvas2d = createAnimatedDnaCanvas(
      seedPhrase, 
      privateKey, 
      primaryHash, 
      secondaryHash, 
      charWidth, 
      charHeight, 
      animationType, 
      phase, 
      flowOffset
    );
    
    // Render to canvas
    renderAsciiArtToCanvas(dnaCanvas2d, ctx, width, height, bgColorHex);
    
    // Add Bitcoin address at the bottom
    const btcAddress = getAttributeValue(seed, 'Bitcoin Address');
    if (btcAddress) {
      addBitcoinAddress(ctx, btcAddress, width, height, bgColorHex);
    }
  };
  
  // Create animated DNA ASCII art canvas
  const createAnimatedDnaCanvas = (
    seedPhrase: string, 
    privateKey: string, 
    primaryHash: string, 
    secondaryHash: string, 
    charWidth: number, 
    charHeight: number, 
    animationType: string, 
    phase: number, 
    flowOffset: number
  ) => {
    // Initialize canvas with space characters
    const canvas = Array(charHeight).fill(0).map(() => 
      Array(charWidth).fill(0).map(() => [' ', 0])
    );
    
    // Get hash values for pattern generation
    const hashValues: number[] = [];
    for (let i = 0; i < primaryHash.length; i += 2) {
      if (i + 2 <= primaryHash.length) {
        hashValues.push(parseInt(primaryHash.substring(i, i + 2), 16));
      }
    }
    
    // Create pseudo-random generators based on hashes
    const primaryRandom = createSeededRandom(primaryHash);
    const secondaryRandom = createSeededRandom(secondaryHash);
    
    // Character sets derived from hashes
    const dnaChars = "ACGT01" + primaryHash.substring(0, 8);
    const connectorChars = "-=+|><^" + secondaryHash.substring(0, 8);
    const backgroundChars = ".,:;'`" + primaryHash.substring(8, 16);
    
    // Fill background with low-density characters
    for (let y = 0; y < charHeight; y++) {
      for (let x = 0; x < charWidth; x++) {
        if (secondaryRandom() > 0.15) {
          canvas[y][x] = [
            backgroundChars.charAt(Math.floor(secondaryRandom() * backgroundChars.length)),
            0.2 + secondaryRandom() * 0.2
          ];
        }
      }
    }
    
    // Apply animation effect based on selected type
    switch(animationType) {
      case 'rotate':
        drawRotatingDnaHelix(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars, connectorChars, phase);
        break;
      case 'flow':
        drawFlowingDnaHelix(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars, connectorChars, flowOffset);
        break;
      case 'combined':
        drawCombinedAnimatedDnaHelix(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars, connectorChars, phase, flowOffset);
        break;
      case 'pulse':
        drawPulsingDnaHelix(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars, connectorChars, phase);
        break;
      default:
        // Default to combined animation
        drawCombinedAnimatedDnaHelix(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars, connectorChars, phase, flowOffset);
    }
    
    // Add variations based on hash values
    addDnaVariations(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars, connectorChars);
    
    // Embed characters from seed phrase and private key
    embedSourceText(canvas, charWidth, charHeight, seedPhrase + privateKey, hashValues, primaryRandom);
    
    return canvas;
  };
  
  // Draw rotating DNA helix (continuous spin animation)
  const drawRotatingDnaHelix = (
    canvas: Array<Array<[string, number]>>, 
    charWidth: number, 
    charHeight: number, 
    hashValues: number[], 
    primaryRandom: () => number, 
    dnaChars: string, 
    connectorChars: string, 
    phase: number
  ) => {
    // Extract parameters from hash to create unique but consistent DNA helices
    const direction = hashValues[0] % 2 === 0 ? 1 : -1;
    
    // Amplitude parameters
    const amplitudeBase = Math.floor(charWidth / 10);
    const amplitudeVariation = hashValues[1] % 15;
    const amplitude = amplitudeBase + amplitudeVariation;
    
    // Frequency parameters
    const frequencyBase = 0.03;
    const frequencyVariation = (hashValues[2] % 12) / 100.0;
    const frequency = frequencyBase + frequencyVariation;
    
    // Other parameters
    const strandThickness = 2 + (hashValues[4] % 2);
    const basePairSpacing = 3 + (hashValues[5] % 4);
    
    // Character sets
    const backboneChars = dnaChars + "01".repeat(3);
    
    // DNA helix positioning
    let helixCenter = Math.floor(charWidth / 2);
    const offset = (hashValues[6] % 40) - 20;
    helixCenter += offset;
    
    // Create DNA helix with rotation
    for (let y = 0; y < charHeight; y++) {
      // Skip the bottom area where the BTC address will be displayed
      if (y > charHeight - 7) continue;
      
      // Calculate phase for this row with animation
      const rowPhase = phase + y * frequency * Math.PI;
      
      // Calculate x-positions of the two backbones with animated rotation
      const strand1X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase));
      const strand2X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase + Math.PI));
      
      // Draw the two backbone strands with thickness
      for (let dx = -strandThickness; dx <= strandThickness; dx++) {
        const x1 = strand1X + dx;
        const x2 = strand2X + dx;
        
        // Ensure we're within canvas bounds
        if (x1 >= 0 && x1 < charWidth) {
          // Higher brightness for backbone
          const brightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x1] = [char, brightness];
        }
        
        if (x2 >= 0 && x2 < charWidth) {
          // Higher brightness for backbone
          const brightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x2] = [char, brightness];
        }
      }
      
      // Draw base pairs (connecting rungs) at regular intervals
      if (y % basePairSpacing === 0) {
        // Determine the range to draw the base pair
        let [startX, endX] = [strand1X, strand2X].sort((a, b) => a - b);
        
        // Add some padding to not connect directly to backbone
        startX += strandThickness;
        endX -= strandThickness;
        
        if (startX < endX) {
          // Calculate number of connector segments
          const numSegments = endX - startX;
          
          // Draw base pair with varying brightness for 3D effect
          for (let i = 0; i < numSegments; i++) {
            const x = startX + i;
            if (x >= 0 && x < charWidth) {
              // Position along the connector (0-1)
              const pos = i / Math.max(1, numSegments - 1);
              
              // Parabolic brightness curve - brightest in middle
              const brightness = 1.0 - Math.abs(pos - 0.5) * 0.3;
              
              // Choose different connector characters
              const connectorIdx = Math.floor(primaryRandom() * connectorChars.length);
              const connector = connectorChars.charAt(connectorIdx);
              
              // Set connector character and brightness
              canvas[y][x] = [connector, brightness];
            }
          }
        }
      }
    }
  };
  
  // Draw flowing DNA helix (continuous downward flow animation)
  const drawFlowingDnaHelix = (
    canvas: Array<Array<[string, number]>>, 
    charWidth: number, 
    charHeight: number, 
    hashValues: number[], 
    primaryRandom: () => number, 
    dnaChars: string, 
    connectorChars: string, 
    flowOffset: number
  ) => {
    // Extract parameters from hash to create unique but consistent DNA helices
    const direction = hashValues[0] % 2 === 0 ? 1 : -1;
    
    // Amplitude parameters
    const amplitudeBase = Math.floor(charWidth / 10);
    const amplitudeVariation = hashValues[1] % 15;
    const amplitude = amplitudeBase + amplitudeVariation;
    
    // Frequency parameters
    const frequencyBase = 0.03;
    const frequencyVariation = (hashValues[2] % 12) / 100.0;
    const frequency = frequencyBase + frequencyVariation;
    
    // Other parameters
    const phaseShift = (hashValues[3] % 20) / 10.0;
    const strandThickness = 2 + (hashValues[4] % 2);
    const basePairSpacing = 3 + (hashValues[5] % 4);
    
    // Character sets
    const backboneChars = dnaChars + "01".repeat(3);
    
    // DNA helix positioning
    let helixCenter = Math.floor(charWidth / 2);
    const offset = (hashValues[6] % 40) - 20;
    helixCenter += offset;
    
    // Create DNA helix with flowing effect
    for (let y = 0; y < charHeight; y++) {
      // Skip the bottom area where the BTC address will be displayed
      if (y > charHeight - 7) continue;
      
      // Calculate phase for this row with flowing animation
      // Use modulo to create endless cycling effect
      const adjustedY = (y + flowOffset) % (charHeight * 2);
      const phase = phaseShift + adjustedY * frequency * Math.PI;
      
      // Calculate x-positions of the two backbones
      const strand1X = Math.floor(helixCenter + amplitude * Math.sin(direction * phase));
      const strand2X = Math.floor(helixCenter + amplitude * Math.sin(direction * phase + Math.PI));
      
      // Draw the two backbone strands with thickness
      for (let dx = -strandThickness; dx <= strandThickness; dx++) {
        const x1 = strand1X + dx;
        const x2 = strand2X + dx;
        
        // Ensure we're within canvas bounds
        if (x1 >= 0 && x1 < charWidth) {
          // Higher brightness for backbone
          const brightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x1] = [char, brightness];
        }
        
        if (x2 >= 0 && x2 < charWidth) {
          // Higher brightness for backbone
          const brightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x2] = [char, brightness];
        }
      }
      
      // Draw base pairs (connecting rungs) at regular intervals with flowing effect
      if (Math.floor(adjustedY) % basePairSpacing === 0) {
        // Determine the range to draw the base pair
        let [startX, endX] = [strand1X, strand2X].sort((a, b) => a - b);
        
        // Add some padding to not connect directly to backbone
        startX += strandThickness;
        endX -= strandThickness;
        
        if (startX < endX) {
          // Calculate number of connector segments
          const numSegments = endX - startX;
          
          // Draw base pair with varying brightness for 3D effect
          for (let i = 0; i < numSegments; i++) {
            const x = startX + i;
            if (x >= 0 && x < charWidth) {
              // Position along the connector (0-1)
              const pos = i / Math.max(1, numSegments - 1);
              
              // Parabolic brightness curve - brightest in middle
              const brightness = 1.0 - Math.abs(pos - 0.5) * 0.3;
              
              // Choose different connector characters
              const connectorIdx = Math.floor(primaryRandom() * connectorChars.length);
              const connector = connectorChars.charAt(connectorIdx);
              
              // Set connector character and brightness
              canvas[y][x] = [connector, brightness];
            }
          }
        }
      }
    }
  };
  
  // Draw combined effect DNA helix (rotating + flowing)
  const drawCombinedAnimatedDnaHelix = (
    canvas: Array<Array<[string, number]>>, 
    charWidth: number, 
    charHeight: number, 
    hashValues: number[], 
    primaryRandom: () => number, 
    dnaChars: string, 
    connectorChars: string, 
    phase: number, 
    flowOffset: number
  ) => {
    // Extract parameters from hash to create unique but consistent DNA helices
    const direction = hashValues[0] % 2 === 0 ? 1 : -1;
    
    // Amplitude parameters
    const amplitudeBase = Math.floor(charWidth / 10);
    const amplitudeVariation = hashValues[1] % 15;
    const amplitude = amplitudeBase + amplitudeVariation;
    
    // Frequency parameters
    const frequencyBase = 0.03;
    const frequencyVariation = (hashValues[2] % 12) / 100.0;
    const frequency = frequencyBase + frequencyVariation;
    
    // Other parameters
    const strandThickness = 2 + (hashValues[4] % 2);
    const basePairSpacing = 3 + (hashValues[5] % 4);
    
    // Character sets
    const backboneChars = dnaChars + "01".repeat(3);
    
    // DNA helix positioning
    let helixCenter = Math.floor(charWidth / 2);
    const offset = (hashValues[6] % 40) - 20;
    helixCenter += offset;
    
    // Create DNA helix with combined animation effects
    for (let y = 0; y < charHeight; y++) {
      // Skip the bottom area where the BTC address will be displayed
      if (y > charHeight - 7) continue;
      
      // Calculate phase for this row with combined animation
      // Flowing effect (vertical movement)
      const adjustedY = (y + flowOffset) % (charHeight * 2);
      // Rotation effect (phase shift)
      const rowPhase = phase + adjustedY * frequency * Math.PI;
      
      // Calculate x-positions of the two backbones with animated rotation
      const strand1X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase));
      const strand2X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase + Math.PI));
      
      // Draw the two backbone strands with thickness
      for (let dx = -strandThickness; dx <= strandThickness; dx++) {
        const x1 = strand1X + dx;
        const x2 = strand2X + dx;
        
        // Ensure we're within canvas bounds
        if (x1 >= 0 && x1 < charWidth) {
          // Higher brightness for backbone
          const brightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x1] = [char, brightness];
        }
        
        if (x2 >= 0 && x2 < charWidth) {
          // Higher brightness for backbone
          const brightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x2] = [char, brightness];
        }
      }
      
      // Draw base pairs at regular intervals with combined animation
      if (Math.floor(adjustedY) % basePairSpacing === 0) {
        // Determine the range to draw the base pair
        let [startX, endX] = [strand1X, strand2X].sort((a, b) => a - b);
        
        // Add some padding to not connect directly to backbone
        startX += strandThickness;
        endX -= strandThickness;
        
        if (startX < endX) {
          // Calculate number of connector segments
          const numSegments = endX - startX;
          
          // Draw base pair with varying brightness for 3D effect
          for (let i = 0; i < numSegments; i++) {
            const x = startX + i;
            if (x >= 0 && x < charWidth) {
              // Position along the connector (0-1)
              const pos = i / Math.max(1, numSegments - 1);
              
              // Parabolic brightness curve - brightest in middle
              const brightness = 1.0 - Math.abs(pos - 0.5) * 0.3;
              
              // Choose different connector characters
              const connectorIdx = Math.floor(primaryRandom() * connectorChars.length);
              const connector = connectorChars.charAt(connectorIdx);
              
              // Set connector character and brightness
              canvas[y][x] = [connector, brightness];
            }
          }
        }
      }
    }
  };
  
  // Draw pulsing DNA helix (brightness pulsation)
  const drawPulsingDnaHelix = (
    canvas: Array<Array<[string, number]>>, 
    charWidth: number, 
    charHeight: number, 
    hashValues: number[], 
    primaryRandom: () => number, 
    dnaChars: string, 
    connectorChars: string, 
    phase: number
  ) => {
    // Extract parameters from hash to create unique but consistent DNA helices
    const direction = hashValues[0] % 2 === 0 ? 1 : -1;
    
    // Amplitude parameters
    const amplitudeBase = Math.floor(charWidth / 10);
    const amplitudeVariation = hashValues[1] % 15;
    const amplitude = amplitudeBase + amplitudeVariation;
    
    // Frequency parameters
    const frequencyBase = 0.03;
    const frequencyVariation = (hashValues[2] % 12) / 100.0;
    const frequency = frequencyBase + frequencyVariation;
    
    // Other parameters
    const phaseShift = (hashValues[3] % 20) / 10.0;
    const strandThickness = 2 + (hashValues[4] % 2);
    const basePairSpacing = 3 + (hashValues[5] % 4);
    
    // Character sets
    const backboneChars = dnaChars + "01".repeat(3);
    
    // DNA helix positioning
    let helixCenter = Math.floor(charWidth / 2);
    const offset = (hashValues[6] % 40) - 20;
    helixCenter += offset;
    
    // Pulse brightness value (0-1)
    const pulseValue = (Math.sin(phase) + 1) / 2; // Convert sine wave to 0-1 range
    
    // Create DNA helix with pulsing brightness
    for (let y = 0; y < charHeight; y++) {
      // Skip the bottom area where the BTC address will be displayed
      if (y > charHeight - 7) continue;
      
      // Calculate phase for this row
      const rowPhase = phaseShift + y * frequency * Math.PI;
      
      // Calculate x-positions of the two backbones
      const strand1X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase));
      const strand2X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase + Math.PI));
      
      // Draw the two backbone strands with thickness and pulsing effect
      for (let dx = -strandThickness; dx <= strandThickness; dx++) {
        const x1 = strand1X + dx;
        const x2 = strand2X + dx;
        
        // Ensure we're within canvas bounds
        if (x1 >= 0 && x1 < charWidth) {
          // Higher brightness for backbone with pulsing effect
          const baseBrightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const brightness = 0.5 + (baseBrightness * 0.5 * pulseValue);
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x1] = [char, brightness];
        }
        
        if (x2 >= 0 && x2 < charWidth) {
          // Higher brightness for backbone with pulsing effect
          const baseBrightness = 1.0 - (Math.abs(dx) / (strandThickness + 1)) * 0.2;
          const brightness = 0.5 + (baseBrightness * 0.5 * pulseValue);
          const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
          canvas[y][x2] = [char, brightness];
        }
      }
      
      // Draw base pairs (connecting rungs) at regular intervals
      if (y % basePairSpacing === 0) {
        // Determine the range to draw the base pair
        let [startX, endX] = [strand1X, strand2X].sort((a, b) => a - b);
        
        // Add some padding to not connect directly to backbone
        startX += strandThickness;
        endX -= strandThickness;
        
        if (startX < endX) {
          // Calculate number of connector segments
          const numSegments = endX - startX;
          
          // Draw base pair with varying brightness for 3D effect and pulsing
          for (let i = 0; i < numSegments; i++) {
            const x = startX + i;
            if (x >= 0 && x < charWidth) {
              // Position along the connector (0-1)
              const pos = i / Math.max(1, numSegments - 1);
              
              // Parabolic brightness curve - brightest in middle with pulsing
              const baseBrightness = 1.0 - Math.abs(pos - 0.5) * 0.3;
              const brightness = 0.5 + (baseBrightness * 0.5 * pulseValue);
              
              // Choose different connector characters
              const connectorIdx = Math.floor(primaryRandom() * connectorChars.length);
              const connector = connectorChars.charAt(connectorIdx);
              
              // Set connector character and brightness
              canvas[y][x] = [connector, brightness];
            }
          }
        }
      }
    }
  };
  
  // Add variations to the DNA pattern
  const addDnaVariations = (
    canvas: Array<Array<[string, number]>>, 
    charWidth: number, 
    charHeight: number, 
    hashValues: number[], 
    primaryRandom: () => number, 
    dnaChars: string, 
    connectorChars: string
  ) => {
    // Determine variation type
    const variationType = hashValues[7] % 4;
    
    // Determine the height limit to avoid overlapping with the BTC address area
    const addressAreaStart = charHeight - 7;
    
    if (variationType === 0) {
      // Add horizontal striation patterns
      const striationSpacing = 10 + hashValues[8] % 10;
      const striationDensity = 0.3 + (hashValues[9] % 10) / 100.0;
      
      for (let y = 0; y < addressAreaStart; y += striationSpacing) {
        for (let x = 0; x < charWidth; x++) {
          if (primaryRandom() < striationDensity) {
            const charIdx = Math.floor(primaryRandom() * dnaChars.length);
            const char = dnaChars.charAt(charIdx);
            canvas[y][x] = [char, 0.7];
          }
        }
      }
    } else if (variationType === 1) {
      // Add vertical data streams
      const streamSpacing = 25 + hashValues[9] % 20;
      const streamDensity = 0.2 + (hashValues[10] % 15) / 100.0;
      
      for (let x = 0; x < charWidth; x += streamSpacing) {
        for (let y = 0; y < addressAreaStart; y++) {
          if (primaryRandom() < streamDensity) {
            const chars = "01" + dnaChars.substring(0, 2);
            const charIdx = Math.floor(primaryRandom() * chars.length);
            const char = chars.charAt(charIdx);
            canvas[y][x] = [char, 0.7];
          }
        }
      }
    } else if (variationType === 2) {
      // Add diagonal accent lines
      const diagonalSpacing = 35 + hashValues[10] % 25;
      const diagonalDensity = 0.2 + (hashValues[11] % 10) / 100.0;
      
      for (let i = 0; i < 2 * charWidth; i += diagonalSpacing) {
        for (let j = 0; j < Math.min(charWidth, addressAreaStart); j++) {
          const x = (i + j) % charWidth;
          const y = j % addressAreaStart;
          
          if (x >= 0 && x < charWidth && y >= 0 && y < addressAreaStart && primaryRandom() < diagonalDensity) {
            const charIdx = Math.floor(primaryRandom() * connectorChars.length);
            const char = connectorChars.charAt(charIdx);
            canvas[y][x] = [char, 0.7];
          }
        }
      }
    } else {
      // Add DNA base sequence highlights
      const highlightChance = 0.05 + (hashValues[11] % 10) / 200.0;
      
      for (let y = 0; y < addressAreaStart; y++) {
        if (primaryRandom() < highlightChance) {
          const sequenceLength = 4 + Math.floor(primaryRandom() * 8);
          const startX = Math.floor(primaryRandom() * (charWidth - sequenceLength));
          
          for (let i = 0; i < sequenceLength; i++) {
            const x = startX + i;
            if (x >= 0 && x < charWidth) {
              const char = "ACGT".charAt(Math.floor(primaryRandom() * 4));
              canvas[y][x] = [char, 0.9];
            }
          }
        }
      }
    }
  };
  
  // Embed source text characters into the canvas
  const embedSourceText = (
    canvas: Array<Array<[string, number]>>, 
    charWidth: number, 
    charHeight: number, 
    sourceText: string, 
    hashValues: number[], 
    primaryRandom: () => number
  ) => {
    for (let idx = 0; idx < sourceText.length; idx++) {
      const char = sourceText.charAt(idx);
      if (char.trim()) {  // Skip spaces
        const y = (idx * Math.floor(2 + primaryRandom() * 4)) % (charHeight - 7);  // Avoid address area
        
        // Use variable amplitude based on hash values
        const amplitude = Math.floor(charWidth / 10) + (hashValues[1] % 15);
        const direction = hashValues[0] % 2 === 0 ? 1 : -1;
        const phase = idx * 0.2;
        const xOffset = Math.floor(amplitude * Math.sin(direction * phase));
        const x = (Math.floor(charWidth / 2) + xOffset) % charWidth;
        
        // Insert the character with maximum brightness
        canvas[y][x] = [char, 1.0];
      }
    }
  };
  
  // Render ASCII art to canvas
  const renderAsciiArtToCanvas = (
    asciiCanvas: Array<Array<[string, number]>>, 
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    bgColorHex: string
  ) => {
    const charWidth = asciiCanvas[0].length;
    const charHeight = asciiCanvas.length;
    
    // Calculate pixel dimensions for each character
    const pixelWidth = width / charWidth;
    const pixelHeight = height / charHeight;
    
    // Convert the background color to RGB
    const bgRgb = hexToRgb(bgColorHex);
    
    // Calculate background brightness (0-1)
    const bgBrightness = (bgRgb.r + bgRgb.g + bgRgb.b) / (3 * 255);
    
    // Function to calculate character color based on brightness
    function calculateColor(brightness: number) {
      if (brightness <= 0) return bgColorHex;
      
      if (bgBrightness < 0.5) {  // Dark background
        // Use white text with brightness-adjusted alpha
        const r = Math.min(255, bgRgb.r + Math.floor((255 - bgRgb.r) * brightness * 1.2));
        const g = Math.min(255, bgRgb.g + Math.floor((255 - bgRgb.g) * brightness * 1.2));
        const b = Math.min(255, bgRgb.b + Math.floor((255 - bgRgb.b) * brightness * 1.2));
        return `rgb(${r}, ${g}, ${b})`;
      } else {  // Light background
        // Use darker text that contrasts with background
        const baseR = Math.max(0, bgRgb.r - 180);
        const baseG = Math.max(0, bgRgb.g - 180);
        const baseB = Math.max(0, bgRgb.b - 180);
        
        const r = Math.floor(baseR * (1 - brightness) + 30 * brightness);
        const g = Math.floor(baseG * (1 - brightness) + 30 * brightness);
        const b = Math.floor(baseB * (1 - brightness) + 30 * brightness);
        
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    
    // Draw each character
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let y = 0; y < charHeight; y++) {
      for (let x = 0; x < charWidth; x++) {
        const [char, brightness] = asciiCanvas[y][x];
        
        if (char !== ' ' && brightness > 0) {
          const posX = (x + 0.5) * pixelWidth;
          const posY = (y + 0.5) * pixelHeight;
          
          // Calculate color based on brightness
          ctx.fillStyle = calculateColor(brightness);
          
          // Adjust font size based on canvas dimensions
          const fontSize = Math.max(1, Math.min(pixelWidth, pixelHeight) * 0.9);
          ctx.font = `${fontSize}px monospace`;
          
          // Draw character
          ctx.fillText(char, posX, posY);
        }
      }
    }
  };
  
  // Add Bitcoin address at the bottom of the image
  const addBitcoinAddress = (
    ctx: CanvasRenderingContext2D, 
    btcAddress: string, 
    width: number, 
    height: number, 
    bgColorHex: string
  ) => {
    const infoText = `BTC: ${btcAddress}`;
    
    // Font size proportional to canvas size
    const fontSize = Math.max(16, height * 0.015);
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position the text
    const infoX = width / 2;
    const infoY = height - 25;
    
    // Calculate text color based on background
    const bgRgb = hexToRgb(bgColorHex);
    const bgBrightness = (bgRgb.r + bgRgb.g + bgRgb.b) / (3 * 255);
    
    if (bgBrightness < 0.5) {
      ctx.fillStyle = 'white';  // White text for dark backgrounds
    } else {
      ctx.fillStyle = 'black';  // Black text for light backgrounds
    }
    
    // Draw text
    ctx.fillText(infoText, infoX, infoY);
  };
  
  // Animation functions
  const startMainAnimation = useCallback((seed: BitcoinSeed) => {
    if (!mainCanvasRef.current) return;
    
    // Stop any existing animation
    if (mainAnimationRef.current) {
      cancelAnimationFrame(mainAnimationRef.current);
    }
    
    // Reset animation parameters
    animationPhaseRef.current = 0;
    animationFlowOffsetRef.current = 0;
    
    // Get a random animation style
    const animationStyle = getRandomAnimationStyle();
    
    // Animation loop
    const animate = () => {
      if (!mainCanvasRef.current) return;
      
      // Update animation parameters
      animationPhaseRef.current += 0.05;
      animationFlowOffsetRef.current += 0.5;
      
      // Render frame
      renderDnaFrame(
        seed,
        mainCanvasRef.current,
        animationStyle,
        animationPhaseRef.current,
        animationFlowOffsetRef.current
      );
      
      // Continue animation loop
      mainAnimationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
  }, [getRandomAnimationStyle]);
  
  const startExampleAnimation = useCallback((seed: BitcoinSeed) => {
    if (!exampleCanvasRef.current) return;
    
    // Stop any existing animation
    if (exampleAnimationRef.current) {
      cancelAnimationFrame(exampleAnimationRef.current);
    }
    
    // Reset animation parameters
    exampleAnimationPhaseRef.current = 0;
    exampleAnimationFlowOffsetRef.current = 0;
    
    // Animation loop
    const animate = () => {
      if (!exampleCanvasRef.current) return;
      
      // Update animation parameters
      exampleAnimationPhaseRef.current += 0.05;
      exampleAnimationFlowOffsetRef.current += 0.5;
      
      // Render frame
      renderDnaFrame(
        seed,
        exampleCanvasRef.current,
        'combined', // Always use combined style for example
        exampleAnimationPhaseRef.current,
        exampleAnimationFlowOffsetRef.current
      );
      
      // Continue animation loop
      exampleAnimationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
  }, []);
  
  // Display metadata and seed words
  const renderMetadata = (seed: BitcoinSeed) => {
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold">Metadata</h3>
        <div className="space-y-2">
          {seed.attributes.map((attr) => (
            <div key={attr.trait_type} className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                {attr.trait_type}
              </span>
              <span className="text-sm break-all">
                {attr.trait_type.toLowerCase().includes("phrase") 
                  ? attr.value 
                  : attr.trait_type.toLowerCase().includes("key") || attr.trait_type.toLowerCase().includes("hash")
                    ? `${attr.value.substring(0, 10)}...${attr.value.substring(attr.value.length - 10)}`
                    : attr.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Start animations when components mount or seeds change
  useEffect(() => {
    // Start example animation with the first seed
    if (bitcoinSeeds.length > 0 && !exampleSeed) {
      setExampleSeed(bitcoinSeeds[0]);
    }
  }, []);
  
  useEffect(() => {
    if (exampleSeed) {
      startExampleAnimation(exampleSeed);
    }
    
    return () => {
      if (exampleAnimationRef.current) {
        cancelAnimationFrame(exampleAnimationRef.current);
      }
    };
  }, [exampleSeed, startExampleAnimation]);
  
  useEffect(() => {
    if (selectedSeed) {
      startMainAnimation(selectedSeed);
    }
    
    return () => {
      if (mainAnimationRef.current) {
        cancelAnimationFrame(mainAnimationRef.current);
      }
    };
  }, [selectedSeed, startMainAnimation]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-background/80">
      <main className="flex-1 pt-10 pb-8 px-3 sm:px-4 container mx-auto">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/10 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dna className="h-6 w-6 text-primary" />
                    Bitcoin DNA Visualization
                  </CardTitle>
                  <CardDescription>
                    Explore the hidden connections between cryptocurrency and biological code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="interactive-section grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="upload-section p-6 bg-card rounded-lg shadow-sm">
                      <h2 className="text-lg font-semibold mb-4">Generate Your DNA Visualization</h2>
                      <p className="text-sm text-muted-foreground mb-4">Upload a Bitcoin Seed NFT JSON file to visualize its unique DNA pattern</p>
                      
                      <div className="file-input-wrapper space-y-3">
                        <Label htmlFor="jsonFileInput" className="inline-block bg-muted hover:bg-muted/80 px-4 py-2 rounded-md cursor-pointer transition-colors">
                          <FileJson className="h-4 w-4 inline mr-2" />
                          Choose JSON File
                        </Label>
                        <Input 
                          type="file" 
                          id="jsonFileInput" 
                          accept=".json"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <div className="text-sm text-muted-foreground">{uploadedFileName}</div>
                        <Button 
                          onClick={handleProcessJson}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Generate DNA Visualization
                        </Button>
                      </div>
                    </div>
                    
                    <div className="example-section p-6 bg-card rounded-lg shadow-sm flex flex-col">
                      <h2 className="text-lg font-semibold mb-2">Live Example: Bitcoin Seed #59</h2>
                      <div className="example-canvas-container flex-grow relative overflow-hidden rounded-md bg-black">
                        <canvas 
                          ref={exampleCanvasRef} 
                          width={500} 
                          height={500} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        This animation shows the DNA structure of a Bitcoin wallet with seed phrase: "rotate trumpet metal tape detect suffer invest unusual rather sound hip execute"
                      </p>
                    </div>
                  </div>
                  
                  {selectedSeed && (
                    <div className="flex flex-col items-center">
                      <div className="relative w-full aspect-square max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
                        <canvas 
                          ref={mainCanvasRef} 
                          width={1080} 
                          height={1080} 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <h3 className="text-white text-lg font-bold">{selectedSeed.name}</h3>
                        </div>
                      </div>
                      
                      <div className="mt-4 w-full max-w-2xl">
                        <Button 
                          onClick={downloadAnimation} 
                          disabled={isDownloading || !selectedSeed} 
                          className="w-full"
                        >
                          {isDownloading ? "Preparing Download..." : "Download Animation"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="bg-card/80 backdrop-blur-sm border-primary/10 h-full">
                <CardHeader>
                  <CardTitle>Bitcoin Seed NFTs</CardTitle>
                  <CardDescription>
                    Transform Bitcoin seed phrases into unique DNA-like visualizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedSeed && renderMetadata(selectedSeed)}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle>The Connection Between Bitcoin and DNA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>
                    Bitcoin's cryptographic principles and biological DNA share surprising similarities. 
                    Both represent fundamental information systems that encode, store, and transmit data. 
                    This visualization tool demonstrates their connection by transforming Bitcoin seed phrases 
                    and private keys into DNA-like patterns that are unique to each wallet.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold mb-2">Bitcoin Blockchain</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Digital Ledger:</strong> Records transactions in blocks linked cryptographically</li>
                        <li><strong>Cryptographic Keys:</strong> Uses public-private key pairs for security</li>
                        <li><strong>Immutable:</strong> Once recorded, data cannot be altered</li>
                        <li><strong>Consensus:</strong> Network verifies and agrees on valid transactions</li>
                        <li><strong>Seed Phrases:</strong> 12-24 words that generate private keys</li>
                      </ul>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold mb-2">Biological DNA</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Genetic Code:</strong> Sequences of nucleotides storing biological information</li>
                        <li><strong>Base Pairs:</strong> Uses A-T and G-C pairings for stability</li>
                        <li><strong>Replication:</strong> Self-copies with high fidelity</li>
                        <li><strong>Mutation Resistance:</strong> Error-correction mechanisms protect integrity</li>
                        <li><strong>Evolutionary Record:</strong> Contains history of past generations</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="mt-4">
                    This application was created for educational purposes at MIT Bitcoin Hackathon 2025.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BtcDna;
