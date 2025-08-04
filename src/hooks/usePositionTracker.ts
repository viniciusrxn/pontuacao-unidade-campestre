
import { useState, useEffect, useRef } from 'react';
import { Unit } from '@/types';

interface PositionChange {
  unitId: string;
  previousPosition: number;
  currentPosition: number;
  movement: 'up' | 'down' | 'same';
  justChanged: boolean;
}

export const usePositionTracker = (sortedUnits: Unit[]) => {
  const [positionChanges, setPositionChanges] = useState<PositionChange[]>([]);
  const previousPositionsRef = useRef<Map<string, number>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const currentPositions = new Map<string, number>();
    const newChanges: PositionChange[] = [];

    // Calculate current positions
    sortedUnits.forEach((unit, index) => {
      const currentPosition = index + 1;
      currentPositions.set(unit.id, currentPosition);

      const previousPosition = previousPositionsRef.current.get(unit.id);
      
      if (previousPosition !== undefined && previousPosition !== currentPosition) {
        let movement: 'up' | 'down' | 'same' = 'same';
        
        if (currentPosition < previousPosition) {
          movement = 'up';
        } else if (currentPosition > previousPosition) {
          movement = 'down';
        }

        newChanges.push({
          unitId: unit.id,
          previousPosition,
          currentPosition,
          movement,
          justChanged: true
        });

        // Clear existing timeout for this unit
        const existingTimeout = timeoutsRef.current.get(unit.id);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set timeout to remove the "justChanged" flag after 3 seconds
        const timeout = setTimeout(() => {
          setPositionChanges(prev => 
            prev.map(change => 
              change.unitId === unit.id 
                ? { ...change, justChanged: false }
                : change
            )
          );
          timeoutsRef.current.delete(unit.id);
        }, 3000);

        timeoutsRef.current.set(unit.id, timeout);
      }
    });

    // Update position changes
    if (newChanges.length > 0) {
      setPositionChanges(prev => {
        // Remove old changes for units that changed again
        const filteredPrev = prev.filter(change => 
          !newChanges.some(newChange => newChange.unitId === change.unitId)
        );
        return [...filteredPrev, ...newChanges];
      });
    }

    // Update previous positions
    previousPositionsRef.current = currentPositions;

    // Cleanup timeouts on unmount
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [sortedUnits]);

  const getPositionChange = (unitId: string): PositionChange | undefined => {
    return positionChanges.find(change => change.unitId === unitId);
  };

  return { getPositionChange };
};
