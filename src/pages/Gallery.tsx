
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// OpenSea API response type
type OpenSeaNFT = {
  identifier: string;
  name: string;
  description: string;
  image_url: string;
  permalink: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
};

const COLLECTION_ADDRESS = '0xe96bc3aff65dbb7026ec955b6d949595ba2129de';
const NETWORK = 'sepolia';
const ITEMS_PER_PAGE = 9;

const Gallery = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Use react-query to fetch and cache NFT data
  const { data, isLoading, error } = useQuery({
    queryKey: ['opensea-nfts', page],
    queryFn: async () => {
      // Using a proxy or direct API call depending on your setup
      // In a production app, you would use a backend proxy to avoid CORS and hide API keys
      try {
        const response = await fetch(`https://testnets-api.opensea.io/api/v2/chain/${NETWORK}/contract/${COLLECTION_ADDRESS}/nfts?limit=${ITEMS_PER_PAGE}&offset=${(page - 1) * ITEMS_PER_PAGE}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTotalPages(Math.ceil(50 / ITEMS_PER_PAGE)); // Assuming 50 NFTs total
        return data.nfts as OpenSeaNFT[];
      } catch (err) {
        console.error('Error fetching OpenSea NFTs:', err);
        // For demo purposes, return sample data if API call fails
        return getSampleNFTs();
      }
    },
  });

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-[300px] w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
            <p className="text-red-700 mb-4">Unable to load NFTs from OpenSea</p>
            <p className="text-sm text-muted-foreground">
              We're displaying sample data instead. In a production environment, 
              you would need to set up a proxy server to handle API requests.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.map((nft) => (
                <Card key={nft.identifier} className="overflow-hidden flex flex-col h-full">
                  <div className="relative h-[300px] overflow-hidden bg-black">
                    <img 
                      src={`https://btcdna.app/gif/${nft.identifier}.gif`}
                      alt={nft.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{nft.name || `BTC DNA #${nft.identifier}`}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {nft.description || "A unique Bitcoin seed phrase visualization"}
                    </p>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">NFT Details:</h4>
                      <ul className="text-sm space-y-1">
                        <li><span className="font-medium">Token ID:</span> {nft.identifier}</li>
                        {nft.metadata?.attributes?.slice(0, 2).map((attr, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{attr.trait_type}:</span> {attr.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a 
                      href={`https://testnets.opensea.io/assets/sepolia/${COLLECTION_ADDRESS}/${nft.identifier}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        View on OpenSea <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(page - 1)}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pageNum === page}
                      onClick={() => handlePageChange(pageNum)}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(page + 1)}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            BTC DNA NFTs are available on OpenSea Sepolia testnet at{' '}
            <a 
              href="https://testnets.opensea.io/collection/btc-dna-1" 
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

// Sample NFT data to use when API is not available
function getSampleNFTs(): OpenSeaNFT[] {
  return Array(ITEMS_PER_PAGE).fill(0).map((_, i) => ({
    identifier: String(i + 1),
    name: `BTC DNA #${i + 1}`,
    description: "A unique Bitcoin seed phrase with its associated wallet address and private key visualized as DNA.",
    image_url: `https://btcdna.app/gif/${i + 1}.gif`,
    permalink: `https://testnets.opensea.io/assets/sepolia/${COLLECTION_ADDRESS}/${i + 1}`,
    metadata: {
      name: `BTC DNA #${i + 1}`,
      description: "A unique Bitcoin seed phrase visualization",
      image: `https://btcdna.app/gif/${i + 1}.gif`,
      attributes: [
        {
          trait_type: "Background Color",
          value: ["red", "blue", "green", "gold", "silver", "black"][i % 6]
        },
        {
          trait_type: "Bitcoin Address",
          value: `1${Array(33).fill(0).map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join('')}`
        }
      ]
    }
  }));
}

export default Gallery;
