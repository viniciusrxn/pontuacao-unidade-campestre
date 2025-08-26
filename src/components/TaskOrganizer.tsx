import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Filter, Grid, List } from 'lucide-react';
import { Task } from '@/types';
import DifficultyBadge from './DifficultyBadge';
import TaskCategoryBadge from './TaskCategoryBadge';

interface TaskOrganizerProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
  selectedTaskId?: string | null;
  renderTaskCard: (task: Task) => React.ReactNode;
  className?: string;
}

interface TaskGroup {
  category: string;
  tasks: Task[];
  totalPoints: number;
}

interface DifficultyGroup {
  difficulty: string;
  tasks: Task[];
  totalPoints: number;
}

const TaskOrganizer: React.FC<TaskOrganizerProps> = ({
  tasks,
  onTaskSelect,
  selectedTaskId,
  renderTaskCard,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'category' | 'difficulty'>('category');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedDifficulties, setExpandedDifficulties] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set());

  // Agrupar tarefas por categoria
  const tasksByCategory = useMemo(() => {
    const groups: Record<string, TaskGroup> = {};
    
    tasks.forEach(task => {
      const category = task.category || 'geral';
      if (!groups[category]) {
        groups[category] = {
          category,
          tasks: [],
          totalPoints: 0
        };
      }
      groups[category].tasks.push(task);
      groups[category].totalPoints += task.points;
    });
    
    return Object.values(groups).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [tasks]);

  // Agrupar tarefas por dificuldade
  const tasksByDifficulty = useMemo(() => {
    const groups: Record<string, DifficultyGroup> = {};
    
    tasks.forEach(task => {
      const difficulty = task.difficulty || 'easy';
      if (!groups[difficulty]) {
        groups[difficulty] = {
          difficulty,
          tasks: [],
          totalPoints: 0
        };
      }
      groups[difficulty].tasks.push(task);
      groups[difficulty].totalPoints += task.points;
    });
    
    // Ordem de dificuldade
    const difficultyOrder = ['easy', 'medium', 'hard', 'very_hard', 'legendary'];
    return difficultyOrder
      .map(difficulty => groups[difficulty])
      .filter(group => group && group.tasks.length > 0);
  }, [tasks]);

  // Filtrar tarefas baseado nas seleções
  const filteredTasksByCategory = useMemo(() => {
    if (selectedCategories.size === 0) return tasksByCategory;
    return tasksByCategory.filter(group => selectedCategories.has(group.category));
  }, [tasksByCategory, selectedCategories]);

  const filteredTasksByDifficulty = useMemo(() => {
    if (selectedDifficulties.size === 0) return tasksByDifficulty;
    return tasksByDifficulty.filter(group => selectedDifficulties.has(group.difficulty));
  }, [tasksByDifficulty, selectedDifficulties]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleDifficulty = (difficulty: string) => {
    const newExpanded = new Set(expandedDifficulties);
    if (newExpanded.has(difficulty)) {
      newExpanded.delete(difficulty);
    } else {
      newExpanded.add(difficulty);
    }
    setExpandedDifficulties(newExpanded);
  };

  const toggleCategoryFilter = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const toggleDifficultyFilter = (difficulty: string) => {
    const newSelected = new Set(selectedDifficulties);
    if (newSelected.has(difficulty)) {
      newSelected.delete(difficulty);
    } else {
      newSelected.add(difficulty);
    }
    setSelectedDifficulties(newSelected);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedDifficulties(new Set());
  };

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-green-100 text-green-800 border-green-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      case 'very_hard': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant={viewMode === 'category' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('category')}
              className="text-xs px-2 sm:px-3"
            >
              <Grid className="w-3 h-3 mr-1" />
              <span className="hidden xs:inline">Por </span>Categoria
            </Button>
            <Button
              variant={viewMode === 'difficulty' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('difficulty')}
              className="text-xs px-2 sm:px-3"
            >
              <List className="w-3 h-3 mr-1" />
              <span className="hidden xs:inline">Por </span>Dificuldade
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs px-2 sm:px-3"
          >
            <Filter className="w-3 h-3 mr-1" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="p-3 sm:p-4">
          <CardTitle className="text-sm mb-3">Filtros</CardTitle>
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium mb-2">Categorias:</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {tasksByCategory.map(group => (
                  <Badge
                    key={group.category}
                    variant={selectedCategories.has(group.category) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs px-2 py-1"
                    onClick={() => toggleCategoryFilter(group.category)}
                  >
                    <TaskCategoryBadge category={group.category} className="!p-0 !bg-transparent !border-0 !text-inherit" />
                    <span className="ml-1">({group.tasks.length})</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium mb-2">Dificuldades:</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {tasksByDifficulty.map(group => (
                  <Badge
                    key={group.difficulty}
                    variant={selectedDifficulties.has(group.difficulty) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs px-2 py-1"
                    onClick={() => toggleDifficultyFilter(group.difficulty)}
                  >
                    <DifficultyBadge difficulty={group.difficulty as any} className="!p-0 !bg-transparent !border-0 !text-inherit" />
                    <span className="ml-1">({group.tasks.length})</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs w-full sm:w-auto"
            >
              Limpar Filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Visualização por Categoria */}
      {viewMode === 'category' && (
        <div className="space-y-3">
          {filteredTasksByCategory.map(group => (
            <Collapsible
              key={group.category}
              open={expandedCategories.has(group.category)}
              onOpenChange={() => toggleCategory(group.category)}
            >
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardHeader className="py-2 sm:py-3 px-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        {expandedCategories.has(group.category) ? (
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        )}
                        <TaskCategoryBadge category={group.category} className="flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-600 text-right flex-shrink-0">
                        <span className="whitespace-nowrap">{group.tasks.length} tarefa{group.tasks.length !== 1 ? 's' : ''}</span>
                        <span className="font-medium text-success whitespace-nowrap">
                          {group.totalPoints} pts
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="pl-2 sm:pl-4 pr-2 sm:pr-0 space-y-2">
                  {group.tasks.map(task => renderTaskCard(task))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Visualização por Dificuldade */}
      {viewMode === 'difficulty' && (
        <div className="space-y-3">
          {filteredTasksByDifficulty.map(group => (
            <Collapsible
              key={group.difficulty}
              open={expandedDifficulties.has(group.difficulty)}
              onOpenChange={() => toggleDifficulty(group.difficulty)}
            >
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardHeader className="py-2 sm:py-3 px-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        {expandedDifficulties.has(group.difficulty) ? (
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        )}
                        <DifficultyBadge difficulty={group.difficulty as any} className="flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {getDifficultyLabel(group.difficulty)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-600 text-right flex-shrink-0">
                        <span className="whitespace-nowrap">{group.tasks.length} tarefa{group.tasks.length !== 1 ? 's' : ''}</span>
                        <span className="font-medium text-success whitespace-nowrap">
                          {group.totalPoints} pts
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="pl-2 sm:pl-4 pr-2 sm:pr-0 space-y-2">
                  {group.tasks.map(task => renderTaskCard(task))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Resumo */}
      <div className="text-center text-xs text-gray-500">
        {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} disponível{tasks.length !== 1 ? 's' : ''} • 
        Total: {tasks.reduce((sum, task) => sum + task.points, 0)} pontos
      </div>
    </div>
  );
};

export default TaskOrganizer;
