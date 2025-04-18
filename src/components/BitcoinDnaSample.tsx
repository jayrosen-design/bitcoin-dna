
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Lightbox } from '@/components/ui/lightbox';

const BitcoinDnaSample = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState({ src: '', alt: '' });
  
  const seedPhrase = [
    "rabbit", "endless", "review", "rather", "axis", "lamp", 
    "wide", "comfort", "method", "network", "slam", "country"
  ];

  const openLightbox = (src: string, alt: string) => {
    setCurrentImage({ src, alt });
    setLightboxOpen(true);
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border-primary/10 rounded-lg p-6 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4 text-center">Generate Your Own Bitcoin DNA</h2>
      <div 
        className="relative w-full mb-6 overflow-hidden rounded-lg border border-primary/20 cursor-pointer"
        onClick={() => openLightbox("https://i.imgur.com/kfvTro8.gif", "Bitcoin DNA #22 Animation")}
      >
        <img 
          src="https://i.imgur.com/kfvTro8.gif" 
          alt="Bitcoin DNA Animation" 
          className="w-full object-contain"
          loading="lazy"
          onError={(e) => {
            console.log("Main image failed to load");
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="w-full mb-6">
        <h3 className="text-lg font-medium mb-3">BTC DNA #22 Seed Phrase</h3>
        <div className="grid grid-cols-3 gap-2 p-4 bg-secondary/50 rounded-lg">
          {seedPhrase.map((word, index) => (
            <div 
              key={index}
              className="flex items-center"
            >
              <span className="text-muted-foreground mr-2 text-xs font-mono">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <span className="font-medium">{word}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Address: 15Q9z73Ck3nPmJoaKPspKrgBedEaEvBmFB
        </p>
      </div>
      
      <Link to="/btc-dna">
        <Button className="px-8 py-6 text-lg">
          Create BTC DNA <ArrowRight className="ml-2" />
        </Button>
      </Link>

      <Lightbox 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)}
        imageSrc={currentImage.src}
        imageAlt={currentImage.alt}
      />
    </div>
  );
};

export default BitcoinDnaSample;
