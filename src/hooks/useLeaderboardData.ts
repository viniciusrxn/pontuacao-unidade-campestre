
import { useState, useEffect } from 'react';
import { Unit } from '@/types';

export const useLeaderboardData = (units: Unit[]) => {
  const [sortedUnits, setSortedUnits] = useState<Unit[]>([]);

  const getRankWithTies = (units: Unit[], currentIndex: number): number => {
    if (currentIndex === 0) return 1;
    
    const currentScore = units[currentIndex].score;
    const previousScore = units[currentIndex - 1].score;
    
    if (previousScore === currentScore) {
      // Find the first position with this score
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (units[i].score !== currentScore) {
          return i + 2;
        }
      }
      return 1; // All tied for first
    }
    
    return currentIndex + 1;
  };

  useEffect(() => {
    // Sort units by score in descending order (highest score first)
    const sorted = [...units].sort((a, b) => b.score - a.score);
    setSortedUnits(sorted);
  }, [units]);

  return {
    sortedUnits,
    getRankWithTies: (index: number) => getRankWithTies(sortedUnits, index)
  };
};
