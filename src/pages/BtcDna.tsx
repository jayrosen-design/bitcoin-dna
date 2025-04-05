
import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type NftData = {
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};

const COLORS: Record<string, { hex: string }> = {
  "red": { "hex": "#8B0000" },
  "orange": { "hex": "#FF8C00" },
  "yellow": { "hex": "#FFD700" },
  "green": { "hex": "#006400" },
  "blue": { "hex": "#00008B" },
  "indigo": { "hex": "#4B0082" },
  "violet": { "hex": "#800080" },
  "brown": { "hex": "#8B4513" },
  "black": { "hex": "#000000" },
  "gray": { "hex": "#2F4F4F" },
  "silver": { "hex": "#708090" },
  "gold": { "hex": "#B8860B" }
};

// Sample gallery data
const GALLERY_NFTS = [
  {
    id: 9,
    name: "Bitcoin Seed #9",
    seedPhrase: "away similar scheme beef dawn tag muscle icon flame decorate gate final",
    bgColor: "black",
    btcAddress: "1FVqBseTaJpDCNojz6UEwqpdqLvN6tCMo6",
    imageUrl: "https://btcdna.app/gif/9.gif"
  },
  {
    id: 59,
    name: "Bitcoin Seed #59",
    seedPhrase: "rotate trumpet metal tape detect suffer invest unusual rather sound hip execute",
    bgColor: "red",
    btcAddress: "1NYZLFcgtUyEY2qysiW9AYcBxmpskJJYHz",
    imageUrl: "https://btcdna.app/gif/59.gif"
  },
  {
    id: 17,
    name: "Bitcoin Seed #17",
    seedPhrase: "dish school cherry tomato poverty quote bonus woman rather goddess price crater",
    bgColor: "gray",
    btcAddress: "1J3yN9ZTmrf6Y7oEuN1kbNpn7TconpoK8W",
    imageUrl: "https://btcdna.app/gif/17.gif"
  }
];

const BtcDna = () => {
  const [jsonData, setJsonData] = useState<NftData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const exampleCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationPhaseRef = useRef(0);
  const { toast } = useToast();

  // Example NFT data for demonstration
  const exampleNftData: NftData = {
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
  };

  // Start the example animation when the component mounts
  useEffect(() => {
    const canvas = exampleCanvasRef.current;
    if (canvas) {
      startAnimation(canvas, exampleNftData);
    }

    // Create gallery animations
    GALLERY_NFTS.forEach((nft, index) => {
      const galleryCanvas = document.getElementById(`gallery-canvas-${index}`) as HTMLCanvasElement;
      if (galleryCanvas) {
        startGalleryAnimation(galleryCanvas, nft);
      }
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setJsonData(parsed);
        
        // Start animation with the uploaded data
        if (mainCanvasRef.current) {
          startAnimation(mainCanvasRef.current, parsed);
          setIsAnimating(true);
        }
        
        setErrorMessage('');
        toast({
          title: "Visualization Generated",
          description: `DNA visualization for ${parsed.name} has been created.`,
        });
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        setErrorMessage('Invalid JSON file. Please upload a valid Bitcoin Seed NFT JSON file.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid JSON file. Please upload a valid Bitcoin Seed NFT JSON file.",
        });
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the file.",
      });
    };
    reader.readAsText(file);
  };

  // Animation loop
  const startAnimation = (canvas: HTMLCanvasElement, data: NftData) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationPhaseRef.current = 0;
    
    const animate = () => {
      // Extract necessary data from the NFT
      const seedPhrase = getAttributeValue(data, 'Seed Phrase') || '';
      const privateKey = getAttributeValue(data, 'Private Key') || '';
      const bgColor = getAttributeValue(data, 'Background Color') || 'blue';
      const primaryHash = getAttributeValue(data, 'Primary Hash') || '';
      const secondaryHash = getAttributeValue(data, 'Secondary Hash') || '';
      
      // Render the animation frame
      renderDnaAnimation(
        canvas, 
        seedPhrase, 
        privateKey, 
        bgColor, 
        primaryHash, 
        secondaryHash, 
        animationPhaseRef.current
      );
      
      // Update animation phase for the next frame
      animationPhaseRef.current += 0.05;
      
      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  // Start gallery animation
  const startGalleryAnimation = (canvas: HTMLCanvasElement, nftData: typeof GALLERY_NFTS[0]) => {
    // Create mock data with the required attributes
    const mockData: NftData = {
      name: nftData.name,
      description: "Gallery example",
      attributes: [
        {
          trait_type: "Seed Phrase",
          value: nftData.seedPhrase
        },
        {
          trait_type: "Bitcoin Address",
          value: nftData.btcAddress
        },
        {
          trait_type: "Background Color",
          value: nftData.bgColor
        },
        {
          trait_type: "Primary Hash",
          value: "2d9df1a1efb7b791ed7a621a2ac81ce4ba8e2357d18b2fd247659bc8e1352782" // Sample hash
        },
        {
          trait_type: "Secondary Hash",
          value: "67f8fac45e265f82b7aa887ba0f5f3c9aa2a092fee2d55890e68adb7315c4f8a" // Sample hash
        }
      ]
    };

    let phase = 0;
    
    const animate = () => {
      const seedPhrase = nftData.seedPhrase;
      const privateKey = "sample_private_key_" + nftData.id; // Mock private key
      const bgColor = nftData.bgColor;
      const primaryHash = "2d9df1a1efb7b791ed7a621a2ac81ce4ba8e2357d18b2fd247659bc8e1352782"; // Sample hash
      const secondaryHash = "67f8fac45e265f82b7aa887ba0f5f3c9aa2a092fee2d55890e68adb7315c4f8a"; // Sample hash
      
      renderDnaAnimation(
        canvas, 
        seedPhrase, 
        privateKey, 
        bgColor, 
        primaryHash, 
        secondaryHash, 
        phase
      );
      
      phase += 0.05;
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  // Helper to get attribute value
  const getAttributeValue = (data: NftData, traitType: string): string | null => {
    const attribute = data.attributes.find(attr => attr.trait_type === traitType);
    return attribute ? attribute.value : null;
  };

  // Render the DNA animation
  const renderDnaAnimation = (
    canvas: HTMLCanvasElement,
    seedPhrase: string,
    privateKey: string,
    bgColor: string,
    primaryHash: string,
    secondaryHash: string,
    phase: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background color
    const bgColorHex = COLORS[bgColor]?.hex || '#2F4F4F';
    ctx.fillStyle = bgColorHex;
    ctx.fillRect(0, 0, width, height);

    // Create ASCII canvas with DNA animation
    const charWidth = Math.floor(width / 10); // Determine char width based on canvas size
    const charHeight = Math.floor(height / 20); // Determine char height based on canvas size

    const dnaCanvas = createAnimatedDnaCanvas(
      seedPhrase,
      privateKey,
      primaryHash,
      secondaryHash,
      charWidth,
      charHeight,
      phase
    );

    // Render the ASCII art to the canvas
    renderAsciiArtToCanvas(dnaCanvas, ctx, width, height, bgColorHex);

    // Add bitcoin address at the bottom if available
    const btcAddress = getAttributeValue(jsonData || exampleNftData, 'Bitcoin Address');
    if (btcAddress && canvas === mainCanvasRef.current) {
      addBitcoinAddress(ctx, btcAddress, width, height);
    }
  };

  // Create the animated DNA ASCII art canvas
  const createAnimatedDnaCanvas = (
    seedPhrase: string,
    privateKey: string,
    primaryHash: string,
    secondaryHash: string,
    charWidth: number,
    charHeight: number,
    phase: number
  ): [string, number][][] => {
    // Initialize canvas with space characters and 0 brightness
    const canvas: [string, number][][] = Array(charHeight).fill(0).map(() => 
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
        if (secondaryRandom() > 0.85) {
          canvas[y][x] = [
            backgroundChars.charAt(Math.floor(secondaryRandom() * backgroundChars.length)),
            0.2 + secondaryRandom() * 0.2
          ];
        }
      }
    }

    // Draw rotating DNA helix
    drawRotatingDnaHelix(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars, connectorChars, phase);

    // Add variations based on hash values
    addDnaVariations(canvas, charWidth, charHeight, hashValues, primaryRandom, dnaChars);

    // Embed characters from seed phrase and private key
    embedSourceText(canvas, charWidth, charHeight, seedPhrase + privateKey, hashValues, primaryRandom);

    return canvas;
  };

  // Draw rotating DNA helix (continuous spin animation)
  const drawRotatingDnaHelix = (
    canvas: [string, number][][],
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
    const amplitudeVariation = hashValues[1] % 5;
    const amplitude = amplitudeBase + amplitudeVariation;

    // Frequency parameters
    const frequencyBase = 0.1;
    const frequencyVariation = (hashValues[2] % 10) / 100.0;
    const frequency = frequencyBase + frequencyVariation;

    // Character sets
    const backboneChars = dnaChars;

    // DNA helix positioning
    let helixCenter = Math.floor(charWidth / 2);
    const offset = (hashValues[6] % 10) - 5;
    helixCenter += offset;

    // Create DNA helix with rotation
    for (let y = 0; y < charHeight; y++) {
      // Skip the bottom area where the BTC address will be displayed
      if (y > charHeight - 2) continue;

      // Calculate phase for this row with animation
      const rowPhase = phase + y * frequency * Math.PI;

      // Calculate x-positions of the two backbones with animated rotation
      const strand1X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase));
      const strand2X = Math.floor(helixCenter + amplitude * Math.sin(direction * rowPhase + Math.PI));

      // Draw the two backbone strands
      if (strand1X >= 0 && strand1X < charWidth) {
        const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
        canvas[y][strand1X] = [char, 0.9];
      }

      if (strand2X >= 0 && strand2X < charWidth) {
        const char = backboneChars.charAt(Math.floor(primaryRandom() * backboneChars.length));
        canvas[y][strand2X] = [char, 0.9];
      }

      // Draw base pairs (connecting rungs) at regular intervals
      if (y % 3 === 0) {
        // Determine the range to draw the base pair
        let [startX, endX] = [strand1X, strand2X].sort((a, b) => a - b);

        if (startX < endX) {
          for (let x = startX + 1; x < endX; x++) {
            if (x >= 0 && x < charWidth) {
              const connector = connectorChars.charAt(Math.floor(primaryRandom() * connectorChars.length));
              // Position along the connector (0-1)
              const pos = (x - startX) / (endX - startX);
              // Parabolic brightness curve - brightest in middle
              const brightness = 0.7 + Math.sin(pos * Math.PI) * 0.3;
              canvas[y][x] = [connector, brightness];
            }
          }
        }
      }
    }
  };

  // Add variations to the DNA pattern
  const addDnaVariations = (
    canvas: [string, number][][],
    charWidth: number,
    charHeight: number,
    hashValues: number[],
    primaryRandom: () => number,
    dnaChars: string
  ) => {
    // Add DNA base sequence highlights
    const highlightChance = 0.05 + (hashValues[11] % 10) / 200.0;

    for (let y = 0; y < charHeight - 2; y++) {
      if (primaryRandom() < highlightChance) {
        const sequenceLength = 3 + Math.floor(primaryRandom() * 5);
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
  };

  // Embed source text characters into the canvas
  const embedSourceText = (
    canvas: [string, number][][],
    charWidth: number,
    charHeight: number,
    sourceText: string,
    hashValues: number[],
    primaryRandom: () => number
  ) => {
    for (let idx = 0; idx < sourceText.length; idx++) {
      const char = sourceText.charAt(idx);
      if (char.trim()) {  // Skip spaces
        const y = (idx * Math.floor(1 + primaryRandom() * 2)) % (charHeight - 2);  // Avoid address area

        // Use variable amplitude based on hash values
        const amplitude = Math.floor(charWidth / 10) + (hashValues[1] % 5);
        const direction = hashValues[0] % 2 === 0 ? 1 : -1;
        const phase = idx * 0.2;
        const xOffset = Math.floor(amplitude * Math.sin(direction * phase));
        const x = (Math.floor(charWidth / 2) + xOffset) % charWidth;

        if (x >= 0 && x < charWidth && y >= 0 && y < charHeight) {
          // Insert the character with maximum brightness
          canvas[y][x] = [char, 1.0];
        }
      }
    }
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

  // Render ASCII art to canvas
  const renderAsciiArtToCanvas = (
    asciiCanvas: [string, number][][],
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
    const bgBrightness = bgRgb ? (bgRgb.r + bgRgb.g + bgRgb.b) / (3 * 255) : 0.5;

    // Function to calculate character color based on brightness
    function calculateColor(brightness: number) {
      if (brightness <= 0) return bgColorHex;

      if (bgBrightness < 0.5) {  // Dark background
        // Use white text with brightness-adjusted alpha
        const r = Math.min(255, (bgRgb?.r || 0) + Math.floor((255 - (bgRgb?.r || 0)) * brightness * 1.2));
        const g = Math.min(255, (bgRgb?.g || 0) + Math.floor((255 - (bgRgb?.g || 0)) * brightness * 1.2));
        const b = Math.min(255, (bgRgb?.b || 0) + Math.floor((255 - (bgRgb?.b || 0)) * brightness * 1.2));
        return `rgb(${r}, ${g}, ${b})`;
      } else {  // Light background
        // Use darker text that contrasts with background
        const baseR = Math.max(0, (bgRgb?.r || 200) - 180);
        const baseG = Math.max(0, (bgRgb?.g || 200) - 180);
        const baseB = Math.max(0, (bgRgb?.b || 200) - 180);

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
    height: number
  ) => {
    const infoText = `BTC: ${btcAddress}`;

    // Font size proportional to canvas size
    const fontSize = Math.max(12, height * 0.015);
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Position the text
    const infoX = width / 2;
    const infoY = height - 25;

    // Draw semi-transparent background for text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    const textWidth = ctx.measureText(infoText).width;
    ctx.fillRect(infoX - textWidth / 2 - 10, infoY - fontSize / 2 - 5, textWidth + 20, fontSize + 10);

    // Draw text
    ctx.fillStyle = 'white';
    ctx.fillText(infoText, infoX, infoY);
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

  // Handle file selection button click
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format seed phrase for display
  const formatSeedPhrase = (phrase: string | null) => {
    if (!phrase) return null;
    
    const words = phrase.split(' ');
    if (words.length === 12) {
      return (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {words.map((word, idx) => (
            <div key={idx} className="bg-muted px-2 py-1 rounded text-center text-sm">
              {idx + 1}. {word}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <p className="bg-muted p-3 rounded-md text-sm">{phrase}</p>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        activeCrypto="bitcoin"
        onCryptoChange={() => {}}
        isAccessUnlocked={false}
        onToggleUnlock={() => {}}
        btcPrice={null}
        isPriceLoading={false}
      />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bitcoin DNA Visualization</h1>
            <p className="text-muted-foreground">
              Transform Bitcoin seed phrases into unique DNA-like visualizations
            </p>
          </div>
          <Link to="/gallery">
            <Button variant="outline">
              View Gallery
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Your DNA Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Upload a Bitcoin Seed NFT JSON file to visualize its unique DNA pattern</p>
              
              <div className="space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".json" 
                  onChange={handleFileUpload}
                />
                
                <Button 
                  onClick={handleFileButtonClick} 
                  className="w-full"
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Choose JSON File
                </Button>
                
                {errorMessage && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
                
                {isAnimating && (
                  <div className="mt-6">
                    <div className="relative">
                      <canvas 
                        ref={mainCanvasRef} 
                        width={600} 
                        height={600} 
                        className="w-full h-auto border rounded-md bg-black"
                      />
                    </div>
                    
                    {jsonData && (
                      <div className="mt-4">
                        <h3 className="font-bold text-lg">{jsonData.name}</h3>
                        <p className="text-sm text-muted-foreground">{jsonData.description}</p>
                        
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Seed Phrase:</h4>
                            {formatSeedPhrase(getAttributeValue(jsonData, 'Seed Phrase'))}
                          </div>
                          
                          <div>
                            <h4 className="font-semibold">Bitcoin Address:</h4>
                            <p className="font-mono text-xs break-all">
                              {getAttributeValue(jsonData, 'Bitcoin Address')}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold">Background Color:</h4>
                            <p>{getAttributeValue(jsonData, 'Background Color')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Example Section */}
          <Card>
            <CardHeader>
              <CardTitle>Live Example: Bitcoin Seed #59</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas 
                  ref={exampleCanvasRef} 
                  width={600} 
                  height={600} 
                  className="w-full h-auto border rounded-md bg-black"
                />
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Seed Phrase:</h4>
                {formatSeedPhrase(getAttributeValue(exampleNftData, 'Seed Phrase'))}
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold">Background Color:</h4>
                    <p className="text-sm">Red</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Bitcoin Address:</h4>
                    <p className="text-sm font-mono truncate">1NYZLFcg...JYHz</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gallery Examples Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">DNA Animation Gallery</h2>
          <p className="text-muted-foreground mb-6">
            Each Bitcoin seed phrase creates a unique DNA animation. The patterns are deterministically 
            generated from the cryptographic properties of the wallet.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {GALLERY_NFTS.map((nft, index) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="relative p-4 bg-black">
                  <canvas 
                    id={`gallery-canvas-${index}`}
                    width={400} 
                    height={400} 
                    className="w-full h-auto"
                  />
                </div>
                <CardContent className="mt-4">
                  <h3 className="font-bold text-lg">{nft.name}</h3>
                  
                  <div className="mt-3 space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold">Seed Phrase:</h4>
                      <p className="text-xs break-words">{nft.seedPhrase}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <h4 className="text-sm font-semibold">Background:</h4>
                        <p className="text-sm">{nft.bgColor}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Address:</h4>
                        <p className="text-sm font-mono truncate">{nft.btcAddress.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Educational Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">The Connection Between Bitcoin and DNA</h2>
          <p className="text-muted-foreground mb-6">
            Bitcoin's cryptographic principles and biological DNA share surprising similarities. 
            Both represent fundamental information systems that encode, store, and transmit data.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bitcoin Blockchain</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  <li><span className="font-semibold">Digital Ledger:</span> Records transactions in blocks linked cryptographically</li>
                  <li><span className="font-semibold">Cryptographic Keys:</span> Uses public-private key pairs for security</li>
                  <li><span className="font-semibold">Immutable:</span> Once recorded, data cannot be altered</li>
                  <li><span className="font-semibold">Seed Phrases:</span> 12-24 words that generate private keys</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Biological DNA</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  <li><span className="font-semibold">Genetic Code:</span> Sequences of nucleotides storing biological information</li>
                  <li><span className="font-semibold">Base Pairs:</span> Uses A-T and G-C pairings for stability</li>
                  <li><span className="font-semibold">Replication:</span> Self-copies with high fidelity</li>
                  <li><span className="font-semibold">Mutation Resistance:</span> Error-correction mechanisms protect integrity</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/gallery">
              <Button>
                Explore BTC DNA Gallery
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BtcDna;
