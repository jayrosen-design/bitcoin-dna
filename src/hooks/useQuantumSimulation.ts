
import { useState, useEffect } from 'react';
import { wordList } from '@/utils/wordList';
import { generateRandomBTCAddress } from '@/utils/cryptoAddressGenerator';

export interface SeedPhrase {
  id: number;
  words: string[];
  visualData: number[];
  address: string; // Bitcoin address for this seed phrase
}

export const useQuantumSimulation = () => {
  const [currentPhrase, setCurrentPhrase] = useState<string[]>([]);
  const [iterations, setIterations] = useState(0);
  const [combinations, setCombinations] = useState(0);
  const [phrases, setPhrases] = useState<SeedPhrase[]>([]);
  
  // Generate a random seed phrase (12 words)
  const generateRandomSeedPhrase = () => {
    const selectedIndices: number[] = [];
    const selectedWords: string[] = [];
    
    while (selectedIndices.length < 12) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      if (!selectedIndices.includes(randomIndex)) {
        selectedIndices.push(randomIndex);
        selectedWords.push(wordList[randomIndex]);
      }
    }
    
    setCurrentPhrase(selectedWords);
    setIterations(prev => prev + 1);
    setCombinations(prev => prev + 1);
    
    // Generate a random BTC address for this phrase
    const address = generateRandomBTCAddress();
    
    // Create timestamp with milliseconds for unique ID
    const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
    
    // Add to phrases history (limited to 100)
    const newPhrase: SeedPhrase = {
      id: uniqueId,
      words: selectedWords,
      visualData: selectedIndices,
      address
    };
    
    setPhrases(prev => {
      const updated = [newPhrase, ...prev];
      if (updated.length > 100) {
        return updated.slice(0, 100);
      }
      return updated;
    });
    
    return { selectedWords, selectedIndices, address };
  };
  
  // Initialize with first set of phrases when the hook mounts
  useEffect(() => {
    // Generate initial phrases
    for (let i = 0; i < 10; i++) {
      generateRandomSeedPhrase();
    }
  }, []);
  
  return {
    currentPhrase,
    iterations,
    combinations,
    phrases,
    generateRandomSeedPhrase
  };
};
