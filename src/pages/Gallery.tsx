
import React, { useState } from 'react';
import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { toast } from 'sonner';

// Constants
const COLLECTION_ADDRESS = '0xe96bc3aff65dbb7026ec955b6d949595ba2129de';
const NETWORK = 'sepolia';
const ITEMS_PER_PAGE = 9;
const TOTAL_ITEMS = 50; // 50 NFTs total

const Gallery = () => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  
  // Generate NFT data for the current page
  const generateNftsForPage = (currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, TOTAL_ITEMS);
    
    const nfts = [];
    for (let i = startIndex; i < endIndex; i++) {
      const tokenId = i + 1; // Start from 1 instead of 0
      nfts.push({
        id: tokenId.toString(),
        name: `BTC DNA #${tokenId}`,
        imageUrl: `https://btcdna.app/gif/${tokenId}.gif`,
        openseaUrl: `https://testnets.opensea.io/assets/sepolia/${COLLECTION_ADDRESS}/${tokenId}`
      });
    }
    
    return nfts;
  };
  
  // Get current NFTs
  const currentNfts = generateNftsForPage(page);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setIsLoading(true);
      setPage(newPage);
      window.scrollTo(0, 0);
      toast.info(`Loading page ${newPage}`);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  // Function to generate pagination items
  const renderPaginationItems = () => {
    // Array to store pagination items
    const items = [];
    
    // For small number of pages, show all page numbers
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i === page}
              onClick={() => handlePageChange(i)}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      return items;
    }
    
    // For larger number of pages, use ellipsis
    // Always show first and last page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          isActive={1 === page}
          onClick={() => handlePageChange(1)}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Determine start and end of the displayed range
    let startPage = Math.max(2, page - 1);
    let endPage = Math.min(totalPages - 1, page + 1);
    
    // Adjust the range if we're near the beginning or end
    if (page <= 3) {
      endPage = 4;
    } else if (page >= totalPages - 2) {
      startPage = totalPages - 3;
    }
    
    // Add first ellipsis if needed
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add the page numbers in the middle
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === page}
            onClick={() => handlePageChange(i)}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add last ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add last page
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          isActive={totalPages === page}
          onClick={() => handlePageChange(totalPages)}
          className="cursor-pointer"
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
    
    return items;
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
                <CardContent className="pt-4">
                  <Skeleton className="h-6 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentNfts.map((nft) => (
                <Card key={nft.id} className="overflow-hidden flex flex-col h-full">
                  <div className="relative h-[300px] overflow-hidden bg-black">
                    <img 
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <CardContent className="pt-4 text-center">
                    <h3 className="text-xl font-bold">{nft.name}</h3>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <a 
                      href={nft.openseaUrl}
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
                    aria-disabled={page === 1}
                  />
                </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(page + 1)}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={page === totalPages}
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

export default Gallery;
