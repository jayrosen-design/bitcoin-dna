import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lightbox } from '@/components/ui/lightbox';

interface BitcoinDnaIntroProps {
  currentValue: number;
  btcValue?: number;
}

const BitcoinDnaIntro: React.FC<BitcoinDnaIntroProps> = ({ currentValue, btcValue = 0 }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState({ src: '', alt: '' });

  const nftSamples = [
    {
      id: 12,
      name: "BTC DNA #12",
      imageUrl: "https://i.imgur.com/x8iJ62Q.gif"
    },
    {
      id: 24,
      name: "BTC DNA #24",
      imageUrl: "https://i.imgur.com/fXDRv5y.gif"
    },
    {
      id: 2,
      name: "BTC DNA #2", 
      imageUrl: "https://i.imgur.com/gAn7e73.gif"
    },
    {
      id: 48,
      name: "BTC DNA #48", 
      imageUrl: "https://i.imgur.com/9e23gBW.gif"
    }
  ];

  const openLightbox = (src: string, alt: string) => {
    setCurrentImage({ src, alt });
    setLightboxOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold mb-3 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Bitcoin DNA Visualization</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Each Bitcoin seed phrase creates a unique DNA animation. The patterns are deterministically generated from the cryptographic properties of the wallet. 
        </p>
        
        <p className="text-muted-foreground text-sm mb-4">
          SHA-256 and SHA-512 hashing algorithms create deterministic patterns unique to your keys. 
          The hash values control DNA helix properties, creating visual patterns that are unique to your wallet.
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 bg-secondary/20 p-2 rounded-sm">
          <Info size={14} />
          <span>This application visualizes the cryptographic properties of Bitcoin wallets through DNA-inspired animations.</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="text-sm text-muted-foreground list-decimal ml-5 space-y-2">
          <li>Your Bitcoin wallet's seed phrase is processed securely</li>
          <li>Cryptographic hashing algorithms create deterministic patterns</li>
          <li>The resulting data controls the DNA helix visualization properties</li>
          <li>Each wallet creates a unique visual fingerprint</li>
        </ol>
      </div>
      
      <div className="mt-auto pt-6">
        <h3 className="text-lg font-semibold mb-3">BTC DNA NFTs</h3>
        <div className="grid grid-cols-2 gap-4">
          {nftSamples.map((nft) => (
            <Card key={nft.id} className="overflow-hidden">
              <div 
                className="h-36 bg-black cursor-pointer transition-transform hover:scale-105"
                onClick={() => openLightbox(nft.imageUrl, nft.name)}
              >
                <img 
                  src={nft.imageUrl}
                  alt={nft.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.log("Image failed to load:", nft.imageUrl);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardContent className="p-3 text-center">
                <h3 className="text-sm font-medium">{nft.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Link to="/gallery">
            <Button className="w-full px-8 py-6 text-lg">
              View Gallery <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Lightbox 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)}
        imageSrc={currentImage.src}
        imageAlt={currentImage.alt}
      />
    </div>
  );
};

export default BitcoinDnaIntro;
