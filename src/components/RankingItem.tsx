
import React from 'react';
import { motion } from 'framer-motion';
import UnitDisplay from './UnitDisplay';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Unit } from '@/types';

interface PositionChange {
  unitId: string;
  previousPosition: number;
  currentPosition: number;
  movement: 'up' | 'down' | 'same';
  justChanged: boolean;
}

type RankingItemProps = {
  unit: Unit;
  position: number;
  isCurrentUnit: boolean;
  index: number;
  positionChange?: PositionChange;
};

const RankingItem: React.FC<RankingItemProps> = ({ 
  unit, 
  position, 
  isCurrentUnit, 
  index,
  positionChange 
}) => {
  const hasMovedUp = positionChange?.movement === 'up' && positionChange?.justChanged;
  const hasMovedDown = positionChange?.movement === 'down' && positionChange?.justChanged;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        y: hasMovedUp ? [0, -10, 0] : 0,
        scale: hasMovedUp ? [1, 1.05, 1] : 1
      }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        type: hasMovedUp ? 'spring' : 'tween',
        ease: hasMovedUp ? undefined : 'easeOut',
        stiffness: hasMovedUp ? 300 : undefined,
        damping: hasMovedUp ? 10 : undefined
      }}
      className={`
        flex items-center p-2 md:p-3 rounded-lg transition-all duration-200 min-h-[60px] md:min-h-[auto]
        ${isCurrentUnit 
          ? 'bg-blue-50 border-l-4 border-blue-400 ring-1 ring-blue-200 shadow-sm' 
          : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
        }
        hover:shadow-md
      `}
    >
      {/* Position Number */}
      <div className={`
        w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold mr-2 md:mr-3
        ${position <= 3 
          ? position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-orange-500'
          : 'bg-secondary'
        }
      `}>
        <span className="text-sm md:text-base">{position}</span>
      </div>

      {/* Unit Info */}
      <div className="flex-grow">
        <UnitDisplay name={unit.name} logo={unit.logo} size="md" />
      </div>

      {/* Score and Movement Indicators */}
      <div className="flex items-center gap-2">
        {isCurrentUnit && <Star className="text-yellow-500 w-6 h-6 md:w-5 md:h-5" />}
        
        {/* Movement Indicator */}
        {hasMovedUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 text-green-600"
          >
            <TrendingUp className="w-5 h-5 md:w-4 md:h-4" />
          </motion.div>
        )}
        
        {hasMovedDown && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1 text-red-500"
          >
            <TrendingDown className="w-5 h-5 md:w-4 md:h-4" />
          </motion.div>
        )}
        
        <span className="text-base md:text-lg lg:text-xl font-bold">{unit.score}</span>
      </div>
    </motion.div>
  );
};

export default RankingItem;
