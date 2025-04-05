
import React from 'react';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { Bitcoin, Dna } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';
import { CryptoType } from '@/utils/walletUtils';
import { useState } from 'react';

const About = () => {
  const [activeCrypto, setActiveCrypto] = useState<CryptoType>('bitcoin');
  const [isAccessUnlocked, setIsAccessUnlocked] = useState(false);
  const { btcPrice, ethPrice, isLoading } = useLiveCryptoPrices();

  const handleCryptoChange = (crypto: CryptoType) => {
    setActiveCrypto(crypto);
  };

  const handleToggleUnlock = () => {
    setIsAccessUnlocked(!isAccessUnlocked);
  };

  const handleToggleDeveloperAccess = () => {
    setIsAccessUnlocked(!isAccessUnlocked);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        activeCrypto={activeCrypto}
        onCryptoChange={handleCryptoChange}
        isAccessUnlocked={isAccessUnlocked}
        onToggleUnlock={handleToggleUnlock}
        btcPrice={btcPrice}
        isPriceLoading={isLoading}
      />
      
      <main className="flex-1 container py-6">
        <div className="prose dark:prose-invert max-w-none">
          <div className="flex items-center gap-2 mb-4">
            <Dna className="h-8 w-8 text-bitcoin" />
            <h1 className="text-3xl font-bold mb-0">About Bitcoin DNA</h1>
          </div>
          
          <p className="text-lg">
            Bitcoin DNA is an innovative visualization tool that explores the fascinating connection between cryptocurrency 
            cryptography and biological DNA structures. This educational platform demonstrates how Bitcoin's underlying 
            cryptographic principles can be represented as DNA-like patterns.
          </p>
          
          <h2 className="flex items-center gap-2 mt-8">
            <Bitcoin className="h-6 w-6 text-bitcoin" />
            The Connection Between Bitcoin and DNA
          </h2>
          
          <p>
            Bitcoin's cryptographic principles and biological DNA share surprising similarities. 
            Both represent fundamental information systems that encode, store, and transmit data. 
            This visualization tool demonstrates their connection by transforming Bitcoin seed phrases 
            and private keys into DNA-like patterns that are unique to each wallet.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-bitcoin font-bold mb-3">Bitcoin Blockchain</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Digital Ledger:</strong> Records transactions in blocks linked cryptographically</li>
                <li><strong>Cryptographic Keys:</strong> Uses public-private key pairs for security</li>
                <li><strong>Immutable:</strong> Once recorded, data cannot be altered</li>
                <li><strong>Consensus:</strong> Network verifies and agrees on valid transactions</li>
                <li><strong>Seed Phrases:</strong> 12-24 words that generate private keys</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-primary font-bold mb-3">Biological DNA</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Genetic Code:</strong> Sequences of nucleotides storing biological information</li>
                <li><strong>Base Pairs:</strong> Uses A-T and G-C pairings for stability</li>
                <li><strong>Replication:</strong> Self-copies with high fidelity</li>
                <li><strong>Mutation Resistance:</strong> Error-correction mechanisms protect integrity</li>
                <li><strong>Evolutionary Record:</strong> Contains history of past generations</li>
              </ul>
            </div>
          </div>
          
          <h2>How Bitcoin DNA Works</h2>
          
          <p>
            Our visualization engine transforms Bitcoin seed phrases and private keys into unique DNA-like patterns
            using deterministic algorithms. Each visualization is cryptographically tied to its Bitcoin wallet,
            creating a visual fingerprint that represents your digital assets.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="bg-card rounded-lg p-4 shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bitcoin text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="text-center mt-4 mb-2 font-semibold">Seed Extraction</h3>
              <p className="text-sm text-center">Your Bitcoin wallet's 12-word seed phrase is processed securely to extract its cryptographic properties</p>
            </div>
            
            <div className="bg-card rounded-lg p-4 shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bitcoin text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="text-center mt-4 mb-2 font-semibold">Hash Generation</h3>
              <p className="text-sm text-center">SHA-256 and SHA-512 hashing algorithms create deterministic patterns unique to your keys</p>
            </div>
            
            <div className="bg-card rounded-lg p-4 shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bitcoin text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="text-center mt-4 mb-2 font-semibold">DNA Mapping</h3>
              <p className="text-sm text-center">The hash values control DNA helix properties, creating visual patterns that are unique to your wallet</p>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-md my-8 font-mono text-sm overflow-auto">
            <pre><code># Generating primary hash from seed phrase and private key
combined_data = seed_phrase + private_key
primary_hash = hashlib.sha256(combined_data.encode()).hexdigest()
secondary_hash = hashlib.sha512(combined_data.encode()).hexdigest()

# Extract parameters for DNA visualization
hash_values = [int(primary_hash[i:i+2], 16) for i in range(0, len(primary_hash), 2)]</code></pre>
          </div>
          
          <h2>DNA-Inspired Visualization Features</h2>
          
          <p>
            Our visualization algorithm creates unique DNA-like patterns with properties derived directly from 
            your seed phrase and private key. The visual elements correspond to cryptographic properties.
          </p>
          
          <div className="space-y-4 my-6">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-3">Double Helix Structure</h3>
              <p>The visualization displays a double helix similar to DNA, with structural properties determined by:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Amplitude:</strong> Controlled by the first bytes of your primary hash</li>
                <li><strong>Direction:</strong> Determined by the parity of hash values</li>
                <li><strong>Density:</strong> Reflects the entropy in your seed phrase</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-3">Base Pair Representation</h3>
              <p>Just as DNA uses A-T and G-C base pairs, our visualization uses:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Characters:</strong> A, C, G, T, 0, 1 plus hash-derived symbols</li>
                <li><strong>Connectors:</strong> Represent the bonds between bases</li>
                <li><strong>Spacing:</strong> Variations reflect cryptographic properties</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="bg-muted p-6 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Educational Purpose</h3>
            <p>
              Bitcoin DNA is an educational tool designed to visualize the connection between cryptography and biology.
              This application simulates the process of generating Bitcoin seed phrases, deriving private keys, and 
              creating unique visual representations based on cryptographic hashes. All visualizations are deterministic
              and unique to each seed phrase, demonstrating how complex information systems like Bitcoin and DNA share
              conceptual similarities in their structure and function.
            </p>
          </div>
        </div>
      </main>
      
      <AppFooter
        isAccessUnlocked={isAccessUnlocked}
        onToggleDeveloperAccess={handleToggleDeveloperAccess}
      />
    </div>
  );
};

export default About;
