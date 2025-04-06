
import React from 'react';
import { Button } from "../components/ui/button";
import NFTGallery from "../components/NFTGallery";
import DNAVisualizer from "../components/DNAVisualizer";

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Bitcoin DNA Visualizer
        </h1>
        <p className="text-lg mb-8 max-w-3xl mx-auto">
          Transform Bitcoin seed phrases into unique DNA-like patterns. Each visualization represents 
          the cryptographic fingerprint of a Bitcoin wallet.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Create Your DNA
          </Button>
          <Button variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {/* DNA Visualizer */}
      <section className="mb-16">
        <DNAVisualizer />
      </section>

      {/* NFT Gallery */}
      <section className="mb-16">
        <NFTGallery />
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">DNA Visualization</h3>
            <p>Transform Bitcoin seed phrases into stunning, animated DNA-like visualizations.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Wallet Generator</h3>
            <p>Generate or upload Bitcoin seed phrases and see their associated addresses.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">NFT Collection</h3>
            <p>Browse through our collection of 50 unique Bitcoin DNA NFTs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
