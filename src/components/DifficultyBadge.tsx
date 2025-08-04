
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary';
  className?: string;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, className }) => {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          label: 'Fácil',
          color: 'bg-blue-500 text-white border-blue-600',
          borderColor: 'border-blue-500'
        };
      case 'medium':
        return {
          label: 'Médio',
          color: 'bg-green-500 text-white border-green-600',
          borderColor: 'border-green-500'
        };
      case 'hard':
        return {
          label: 'Difícil',
          color: 'bg-red-400 text-white border-red-500',
          borderColor: 'border-red-400'
        };
      case 'very_hard':
        return {
          label: 'Muito Difícil',
          color: 'bg-gray-700 text-white border-gray-800',
          borderColor: 'border-gray-700'
        };
      case 'legendary':
        return {
          label: 'Lendário',
          color: 'bg-yellow-500 text-black border-yellow-600',
          borderColor: 'border-yellow-500'
        };
      default:
        return {
          label: 'Fácil',
          color: 'bg-blue-500 text-white border-blue-600',
          borderColor: 'border-blue-500'
        };
    }
  };

  const config = getDifficultyConfig(difficulty);

  return (
    <Badge className={`${config.color} text-xs font-medium px-2 py-1 ${className}`}>
      {config.label}
    </Badge>
  );
};

export default DifficultyBadge;
