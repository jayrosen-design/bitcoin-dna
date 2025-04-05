
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OPENSEA_COLLECTION_URL = 'https://testnets.opensea.io/collection/btc-dna-1';
const COLLECTION_ADDRESS = '0xe96bc3aff65dbb7026ec955b6d949595ba2129de';

const Gallery = () => {
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
            <h1 className="text-3xl font-bold mb-2">BTC DNA Gallery</h1>
            <p className="text-muted-foreground">
              Explore the Bitcoin DNA NFT collection - unique visualizations of Bitcoin seed phrases
            </p>
          </div>
          <Link to="/btc-dna">
            <Button variant="outline">
              Create Your Own
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">OpenSea Testnet Collection</h2>
                <p className="text-muted-foreground">BTC DNA NFTs on Sepolia Testnet</p>
              </div>
              <a 
                href={OPENSEA_COLLECTION_URL}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline"
              >
                <span>Open in OpenSea</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-lg shadow overflow-hidden h-[700px]">
          <iframe 
            src={OPENSEA_COLLECTION_URL}
            className="w-full h-full border-0"
            title="BTC DNA OpenSea Collection"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            BTC DNA NFTs are available on OpenSea Sepolia testnet at{' '}
            <a 
              href={OPENSEA_COLLECTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              BTC DNA Collection
            </a>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Contract Address: {COLLECTION_ADDRESS}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Gallery;
