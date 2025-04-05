
import React, { useState, useEffect, useRef } from 'react';
import { Dna } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BitcoinSeed {
  name: string;
  description: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

const BtcDna = () => {
  const [selectedSeed, setSelectedSeed] = useState<BitcoinSeed | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Example Bitcoin Seeds (would come from knowledgebase)
  const bitcoinSeeds: BitcoinSeed[] = [
    {
      "name": "Bitcoin Seed #9",
      "description": "A unique Bitcoin seed phrase with its associated wallet address and private key.",
      "attributes": [
        {
          "trait_type": "Bitcoin Address",
          "value": "1FVqBseTaJpDCNojz6UEwqpdqLvN6tCMo6"
        },
        {
          "trait_type": "Private Key",
          "value": "0791d78ba9eb0ec860eb4675286586b7d23b5c2d9f807992e8cfeab65f390cbe"
        },
        {
          "trait_type": "Seed Phrase",
          "value": "away similar scheme beef dawn tag muscle icon flame decorate gate final"
        },
        {
          "trait_type": "Background Color",
          "value": "black"
        },
        {
          "trait_type": "Primary Hash",
          "value": "df5c60d8b29e2f29e962d82a7ce8cc451f772d8b1e2b874bbb352da72d62b8d5"
        },
        {
          "trait_type": "Secondary Hash",
          "value": "12db842486182f981c9c1c6d0fa1d6b343f2f4fe6960d55ebe37e3d7e07536b14484ad245f3df087784a3061e22c5f57c887c6f7ed91809f6e7534fc0c1b740f"
        }
      ]
    },
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
    },
    {
      "name": "Bitcoin Seed #17",
      "description": "A unique Bitcoin seed phrase with its associated wallet address and private key.",
      "attributes": [
        {
          "trait_type": "Bitcoin Address",
          "value": "1J3yN9ZTmrf6Y7oEuN1kbNpn7TconpoK8W"
        },
        {
          "trait_type": "Private Key",
          "value": "990cbd5af379169b5b93dee7cd6338ed8d1e82b81b92c447f9ff5a58e868cce5"
        },
        {
          "trait_type": "Seed Phrase",
          "value": "dish school cherry tomato poverty quote bonus woman rather goddess price crater"
        },
        {
          "trait_type": "Background Color",
          "value": "gray"
        },
        {
          "trait_type": "Primary Hash",
          "value": "18bbc235bc36e2a1fa0da5071693edf261d854a797524fa7957c7b5dc9252dc6"
        },
        {
          "trait_type": "Secondary Hash",
          "value": "69eabb870193b2eca5cf9d4c8f76a409586737d03b28ccc41e36d8838e3a50dc93fa158dc919ed09ac7f397adf318daf672c6267b10eef7962e3fc9aac596b99"
        }
      ]
    }
  ];

  const renderDnaVisualization = (seed: BitcoinSeed) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get background color
    const bgColorAttr = seed.attributes.find(attr => attr.trait_type === "Background Color");
    const bgColor = bgColorAttr ? bgColorAttr.value : "black";
    
    // Set background
    ctx.fillStyle = getBgColorHex(bgColor);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw DNA helix
    drawDnaHelix(ctx, seed);
    
    // Add Bitcoin address at the bottom
    const btcAddress = seed.attributes.find(attr => attr.trait_type === "Bitcoin Address")?.value || "";
    if (btcAddress) {
      addBitcoinAddress(ctx, btcAddress, canvas.width, canvas.height);
    }
  };
  
  const getBgColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      "red": "#8B0000",      // Dark red
      "black": "#000000",    // Black
      "gray": "#2F4F4F",     // Dark Gray
      "blue": "#00008B",     // Dark blue
      "green": "#006400"     // Dark green
    };
    
    return colors[colorName] || "#2F4F4F";
  };
  
  const drawDnaHelix = (ctx: CanvasRenderingContext2D, seed: BitcoinSeed) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Get seed properties
    const seedPhrase = seed.attributes.find(attr => attr.trait_type === "Seed Phrase")?.value || "";
    const primaryHash = seed.attributes.find(attr => attr.trait_type === "Primary Hash")?.value || "";
    
    // Create a seeded random function
    const seededRandom = createSeededRandom(primaryHash);
    
    // Animation parameters
    const time = Date.now() * 0.001;
    const amplitude = width * 0.15;
    const frequency = 0.03;
    const density = 5;
    
    // DNA properties
    const dnaChars = "ACGT01" + primaryHash.substring(0, 8);
    
    // Draw the double helix
    for (let y = 0; y < height - 50; y += density) {
      // Calculate x positions for the two strands
      const phase = y * frequency + time;
      const x1 = width / 2 + amplitude * Math.sin(phase);
      const x2 = width / 2 + amplitude * Math.sin(phase + Math.PI);
      
      // Draw the strands
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      
      // Vary the color based on position and hash
      const hue = (y + parseInt(primaryHash.substring(0, 2), 16)) % 360;
      ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
      
      // Draw characters at the strands
      const char1 = dnaChars.charAt(Math.floor(seededRandom() * dnaChars.length));
      const char2 = dnaChars.charAt(Math.floor(seededRandom() * dnaChars.length));
      
      ctx.fillText(char1, x1 - 5, y);
      ctx.fillText(char2, x2 - 5, y);
      
      // Draw the base pairs connecting the strands every few steps
      if (y % 20 < density) {
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.stroke();
      }
    }
    
    // Embed seed phrase characters in the visualization
    if (seedPhrase) {
      const words = seedPhrase.split(" ");
      words.forEach((word, idx) => {
        const x = width * (0.2 + 0.6 * seededRandom());
        const y = height * (0.1 + 0.7 * (idx / words.length));
        
        ctx.font = "bold 12px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText(word, x, y);
      });
    }
  };
  
  const addBitcoinAddress = (ctx: CanvasRenderingContext2D, address: string, width: number, height: number) => {
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`BTC: ${address}`, width / 2, height - 20);
  };
  
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
  
  const downloadAnimation = () => {
    if (!selectedSeed) return;
    
    setIsDownloading(true);
    toast.info("Preparing download...");
    
    setTimeout(() => {
      if (canvasRef.current) {
        // In a real app, we would create a GIF here
        // For simplicity, we'll just download the current canvas image
        const link = document.createElement('a');
        link.download = `bitcoin-seed-${selectedSeed.name.replace(/\s+/g, '-')}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
      }
      setIsDownloading(false);
      toast.success("Animation downloaded!");
    }, 1500);
  };
  
  // Animation loop
  useEffect(() => {
    if (!selectedSeed) return;
    
    let animationFrameId: number;
    const animate = () => {
      renderDnaVisualization(selectedSeed);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedSeed]);
  
  useEffect(() => {
    // Set the first seed by default when the component mounts
    if (bitcoinSeeds.length > 0 && !selectedSeed) {
      setSelectedSeed(bitcoinSeeds[0]);
    }
  }, []);

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
                  <div className="flex flex-col items-center">
                    <div className="relative w-full aspect-square max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
                      <canvas 
                        ref={canvasRef} 
                        width={1080} 
                        height={1080} 
                        className="w-full h-full object-contain"
                      />
                      {selectedSeed && (
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <h3 className="text-white text-lg font-bold">{selectedSeed.name}</h3>
                        </div>
                      )}
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
                  <div className="flex flex-col space-y-3">
                    {bitcoinSeeds.map((seed) => (
                      <Button
                        key={seed.name}
                        variant={selectedSeed?.name === seed.name ? "default" : "outline"}
                        className="justify-start w-full"
                        onClick={() => setSelectedSeed(seed)}
                      >
                        <span className="truncate">{seed.name}</span>
                      </Button>
                    ))}
                  </div>
                  
                  {selectedSeed && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Metadata</h3>
                      <div className="space-y-2">
                        {selectedSeed.attributes.map((attr) => (
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
                  )}
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
