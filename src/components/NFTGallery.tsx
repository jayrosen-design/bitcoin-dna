
import React, { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NFT {
  id: number;
  imageUrl: string;
}

const NFTGallery: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Collection of NFTs with custom image URLs for specified NFTs
  const nfts: NFT[] = Array.from({ length: 50 }, (_, i) => {
    const id = i + 1;
    
    // Custom image URLs for specific NFTs
    if (id === 22) return { id, imageUrl: "https://i.imgur.com/kfvTro8.gif" };
    if (id === 12) return { id, imageUrl: "https://i.imgur.com/x8iJ62Q.gif" };
    if (id === 24) return { id, imageUrl: "https://i.imgur.com/fXDRv5y.gif" };
    if (id === 2) return { id, imageUrl: "https://i.imgur.com/gAn7e73.gif" };
    if (id === 48) return { id, imageUrl: "https://i.imgur.com/9e23gBW.gif" };
    
    // Default placeholder for other NFTs
    return { id, imageUrl: `https://via.placeholder.com/400x400/1a1a2e/ffffff?text=Bitcoin+Seed+%23${id}` };
  });

  const totalPages = Math.ceil(nfts.length / itemsPerPage);
  const displayedNfts = nfts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="w-full my-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Bitcoin DNA NFT Collection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedNfts.map((nft) => (
          <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img 
                  src={nft.imageUrl} 
                  alt={`Bitcoin Seed #${nft.id}`}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">Bitcoin Seed #{nft.id}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button 
          variant="outline" 
          onClick={prevPage}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        <div className="text-sm">
          Page {currentPage + 1} of {totalPages}
        </div>
        <Button 
          variant="outline" 
          onClick={nextPage}
          className="flex items-center gap-2"
        >
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NFTGallery;
