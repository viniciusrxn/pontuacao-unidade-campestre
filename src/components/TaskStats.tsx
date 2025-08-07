import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, Target, Clock, CheckCircle } from 'lucide-react';
import { Task } from '@/types';
import DifficultyBadge from './DifficultyBadge';
import TaskCategoryBadge from './TaskCategoryBadge';

interface TaskStatsProps {
  tasks: Task[];
  completedTasks?: Task[];
  pendingTasks?: Task[];
  className?: string;
}

const TaskStats: React.FC<TaskStatsProps> = ({
  tasks,
  completedTasks = [],
  pendingTasks = [],
  className = ''
}) => {
  // Calcular estatísticas
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const completedPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);
  const pendingPoints = pendingTasks.reduce((sum, task) => sum + task.points, 0);
  const availablePoints = totalPoints - completedPoints - pendingPoints;
  
  const completionRate = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  const progressRate = totalPoints > 0 ? ((completedPoints + pendingPoints) / totalPoints) * 100 : 0;

  // Agrupar por categoria
  const categoryStats = tasks.reduce((acc, task) => {
    const category = task.category || 'geral';
    if (!acc[category]) {
      acc[category] = { count: 0, points: 0 };
    }
    acc[category].count++;
    acc[category].points += task.points;
    return acc;
  }, {} as Record<string, { count: number; points: number }>);

  // Agrupar por dificuldade
  const difficultyStats = tasks.reduce((acc, task) => {
    const difficulty = task.difficulty || 'easy';
    if (!acc[difficulty]) {
      acc[difficulty] = { count: 0, points: 0 };
    }
    acc[difficulty].count++;
    acc[difficulty].points += task.points;
    return acc;
  }, {} as Record<string, { count: number; points: number }>);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      case 'very_hard': return 'Muito Difícil';
      case 'legendary': return 'Lendário';
      default: return difficulty;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resumo Geral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5" />
            Resumo das Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span className="font-medium">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{completedPoints} pts concluídos</span>
              <span>{totalPoints} pts total</span>
            </div>
          </div>

          {/* Pontos por Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedPoints}</div>
              <div className="text-xs text-green-700">Concluídos</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingPoints}</div>
              <div className="text-xs text-yellow-700">Em Revisão</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{availablePoints}</div>
              <div className="text-xs text-blue-700">Disponíveis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Categoria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b.points - a.points)
              .map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TaskCategoryBadge category={category} />
                    <span className="text-sm font-medium">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{stats.points} pts</div>
                    <div className="text-xs text-gray-600">{stats.count} tarefa{stats.count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Dificuldade */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Por Dificuldade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(difficultyStats)
              .sort(([a], [b]) => {
                const difficultyOrder = ['easy', 'medium', 'hard', 'very_hard', 'legendary'];
                return difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b);
              })
              .map(([difficulty, stats]) => (
                <div key={difficulty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={difficulty as any} />
                    <span className="text-sm font-medium">
                      {getDifficultyLabel(difficulty)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{stats.points} pts</div>
                    <div className="text-xs text-gray-600">{stats.count} tarefa{stats.count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Tarefas */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximas Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium truncate">{task.title}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-success">{task.points} pts</div>
                      <div className="text-xs text-gray-600">
                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskStats;
