
import React from 'react';
import { motion } from 'framer-motion';
import UnitDisplay from './UnitDisplay';
import { Trophy, Medal, Award } from 'lucide-react';
import { Unit } from '@/types';

type PodiumStepProps = {
  unit: Unit;
  position: number;
  isCurrentUnit: boolean;
  delay?: number;
};

const PodiumStep: React.FC<PodiumStepProps> = ({ unit, position, isCurrentUnit, delay = 0 }) => {
  const podiumConfig = {
    1: {
      height: 'h-32 md:h-40',
      width: 'w-20 md:w-28',
      gradient: 'bg-gradient-to-t from-yellow-400 to-yellow-500',
      icon: Trophy,
      iconColor: 'text-yellow-600',
      shadow: 'shadow-xl',
    },
    2: {
      height: 'h-24 md:h-32',
      width: 'w-16 md:w-24',
      gradient: 'bg-gradient-to-t from-gray-300 to-gray-400',
      icon: Medal,
      iconColor: 'text-gray-600',
      shadow: 'shadow-lg',
    },
    3: {
      height: 'h-20 md:h-24',
      width: 'w-14 md:w-20',
      gradient: 'bg-gradient-to-t from-orange-500 to-orange-600',
      icon: Award,
      iconColor: 'text-orange-700',
      shadow: 'shadow-lg',
    },
  };

  const config = podiumConfig[position as keyof typeof podiumConfig];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center"
    >
      {/* Trophy/Medal Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: delay + 0.2 }}
        className="mb-2"
      >
        <Icon className={`w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ${config.iconColor}`} />
      </motion.div>

      {/* Unit Info */}
      <div className="text-center mb-3">
        <div className="flex flex-col items-center gap-2">
          <UnitDisplay 
            name={unit.name} 
            logo={unit.logo} 
            size="sm"
            className={`${isCurrentUnit ? 'text-primary font-bold' : ''}`}
          />
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl font-black text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4 }}
          >
            {unit.score}
          </motion.p>
        </div>
      </div>

      {/* Podium Step */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        transition={{ duration: 0.8, delay: delay + 0.3 }}
        className={`
          ${config.height} ${config.width} ${config.gradient} ${config.shadow}
          rounded-t-lg flex items-center justify-center
          ${isCurrentUnit ? 'ring-4 ring-blue-400 ring-opacity-75' : ''}
        `}
      >
        <p className="text-lg md:text-2xl lg:text-3xl font-black text-white">#{position}</p>
      </motion.div>
    </motion.div>
  );
};

export default PodiumStep;
