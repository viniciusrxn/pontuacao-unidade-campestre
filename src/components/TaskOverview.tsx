import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Task } from '@/types';

interface TaskOverviewProps {
  availableTasks: Task[];
  pendingTasks: Task[];
  completedTasks: Task[];
  className?: string;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({
  availableTasks,
  pendingTasks,
  completedTasks,
  className = ''
}) => {
  const totalAvailablePoints = availableTasks.reduce((sum, task) => sum + task.points, 0);
  const totalPendingPoints = pendingTasks.reduce((sum, task) => sum + task.points, 0);
  const totalCompletedPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);
  const totalPoints = totalAvailablePoints + totalPendingPoints + totalCompletedPoints;

  const getUrgentTasks = () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return availableTasks.filter(task => {
      const deadline = new Date(task.deadline);
      return deadline <= threeDaysFromNow;
    });
  };

  const urgentTasks = getUrgentTasks();

  return (
    <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 ${className}`}>
      {/* Tarefas Disponíveis */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">Disponíveis</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{availableTasks.length}</div>
              <div className="text-xs text-gray-500 truncate">{totalAvailablePoints} pts</div>
            </div>
            <div className="text-left sm:text-right mt-1 sm:mt-0">
              <Badge variant="secondary" className="text-xs">
                {availableTasks.length > 0 ? 'Ativas' : 'Nenhuma'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarefas Pendentes */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">Em Revisão</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
              <div className="text-xs text-gray-500 truncate">{totalPendingPoints} pts</div>
            </div>
            <div className="text-left sm:text-right mt-1 sm:mt-0">
              <Badge variant="secondary" className="text-xs">
                {pendingTasks.length > 0 ? 'Aguardando' : 'Nenhuma'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarefas Concluídas */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">Concluídas</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-xs text-gray-500 truncate">{totalCompletedPoints} pts</div>
            </div>
            <div className="text-left sm:text-right mt-1 sm:mt-0">
              <Badge variant="secondary" className="text-xs">
                {completedTasks.length > 0 ? 'Finalizadas' : 'Nenhuma'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarefas Urgentes */}
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">Urgentes</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-600">{urgentTasks.length}</div>
              <div className="text-xs text-gray-500 truncate">
                {urgentTasks.reduce((sum, task) => sum + task.points, 0)} pts
              </div>
            </div>
            <div className="text-left sm:text-right mt-1 sm:mt-0">
              <Badge variant="destructive" className="text-xs">
                {urgentTasks.length > 0 ? 'Prestes a vencer' : 'Nenhuma'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskOverview;
