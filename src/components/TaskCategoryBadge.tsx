
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Book, Users, Heart, Zap, Target, Globe } from 'lucide-react';

interface TaskCategoryBadgeProps {
  category: string;
  className?: string;
}

const TaskCategoryBadge: React.FC<TaskCategoryBadgeProps> = ({ category, className }) => {
  const getCategoryConfig = (category: string) => {
    switch (category.toLowerCase()) {
      case 'estudo':
        return {
          label: 'Estudo',
          icon: <Book className="w-3 h-3" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'social':
        return {
          label: 'Social',
          icon: <Users className="w-3 h-3" />,
          color: 'bg-pink-100 text-pink-800 border-pink-200'
        };
      case 'espiritual':
        return {
          label: 'Espiritual',
          icon: <Heart className="w-3 h-3" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'atividade':
        return {
          label: 'Atividade',
          icon: <Zap className="w-3 h-3" />,
          color: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'missao':
        return {
          label: 'Missão',
          icon: <Target className="w-3 h-3" />,
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'comunidade':
        return {
          label: 'Comunidade',
          icon: <Globe className="w-3 h-3" />,
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          label: category,
          icon: <Target className="w-3 h-3" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <Badge className={`${config.color} text-xs font-medium px-2 py-1 flex items-center gap-1 ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default TaskCategoryBadge;
