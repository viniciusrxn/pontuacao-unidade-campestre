
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy, Medal, Star } from 'lucide-react';

interface UnitProgressProps {
  completedTasks: number;
  totalTasks: number;
  totalPoints: number;
  className?: string;
}

const UnitProgress: React.FC<UnitProgressProps> = ({ 
  completedTasks, 
  totalTasks, 
  totalPoints, 
  className 
}) => {
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const getProgressIcon = () => {
    if (progressPercentage >= 90) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (progressPercentage >= 70) return <Medal className="w-5 h-5 text-orange-500" />;
    if (progressPercentage >= 50) return <Award className="w-5 h-5 text-blue-500" />;
    return <Star className="w-5 h-5 text-gray-400" />;
  };

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "bg-yellow-500";
    if (progressPercentage >= 70) return "bg-orange-500";
    if (progressPercentage >= 50) return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {getProgressIcon()}
          Progresso da Unidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Tarefas Concluídas</span>
            <span className="font-bold">{completedTasks} de {totalTasks}</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          
          <div className="flex justify-between items-center text-sm">
            <span>Pontuação Total</span>
            <span className="font-bold text-primary">{totalPoints} pontos</span>
          </div>
          
          {progressPercentage >= 100 && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded-lg">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">🎉 Todas as tarefas concluídas!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitProgress;
