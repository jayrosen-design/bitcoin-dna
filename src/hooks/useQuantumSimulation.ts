
import { useState, useEffect } from 'react';
import { wordList } from '@/utils/wordList';

export interface SeedPhrase {
  id: number;
  words: string[];
  visualData: number[];
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
    
    // Add to phrases history (limited to 100)
    const newPhrase: SeedPhrase = {
      id: Date.now(),
      words: selectedWords,
      visualData: selectedIndices
    };
    
    setPhrases(prev => {
      const updated = [newPhrase, ...prev];
      if (updated.length > 100) {
        return updated.slice(0, 100);
      }
      return updated;
    });
    
    return { selectedWords, selectedIndices };
  };
  
  return {
    currentPhrase,
    iterations,
    combinations,
    phrases,
    generateRandomSeedPhrase
  };
};
