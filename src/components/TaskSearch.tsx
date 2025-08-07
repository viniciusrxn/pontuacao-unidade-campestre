import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Task } from '@/types';
import DifficultyBadge from './DifficultyBadge';
import TaskCategoryBadge from './TaskCategoryBadge';

interface TaskSearchProps {
  tasks: Task[];
  onFilterChange: (filteredTasks: Task[]) => void;
  className?: string;
}

const TaskSearch: React.FC<TaskSearchProps> = ({
  tasks,
  onFilterChange,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPointsRange, setSelectedPointsRange] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Obter categorias e dificuldades únicas
  const categories = useMemo(() => {
    const cats = [...new Set(tasks.map(task => task.category || 'geral'))];
    return cats.sort();
  }, [tasks]);

  const difficulties = useMemo(() => {
    const diffs = [...new Set(tasks.map(task => task.difficulty || 'easy'))];
    return diffs.sort((a, b) => {
      const order = ['easy', 'medium', 'hard', 'very_hard', 'legendary'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [tasks]);

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtro de busca por texto
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de categoria
      const matchesCategory = selectedCategory === 'all' || 
        (task.category || 'geral') === selectedCategory;

      // Filtro de dificuldade
      const matchesDifficulty = selectedDifficulty === 'all' || 
        (task.difficulty || 'easy') === selectedDifficulty;

      // Filtro de pontos
      const matchesPoints = (() => {
        if (selectedPointsRange === 'all') return true;
        
        const points = task.points;
        switch (selectedPointsRange) {
          case 'low': return points <= 25;
          case 'medium': return points > 25 && points <= 75;
          case 'high': return points > 75;
          default: return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesDifficulty && matchesPoints;
    });
  }, [tasks, searchTerm, selectedCategory, selectedDifficulty, selectedPointsRange]);

  // Atualizar filtros quando mudar
  React.useEffect(() => {
    onFilterChange(filteredTasks);
  }, [filteredTasks, onFilterChange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedPointsRange('all');
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

  const getPointsRangeLabel = (range: string) => {
    switch (range) {
      case 'low': return '1-25 pts';
      case 'medium': return '26-75 pts';
      case 'high': return '76+ pts';
      default: return 'Todos';
    }
  };

  const hasActiveFilters = searchTerm !== '' || 
    selectedCategory !== 'all' || 
    selectedDifficulty !== 'all' || 
    selectedPointsRange !== 'all';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar tarefas por título ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filtros Rápidos */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={showAdvancedFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-xs"
        >
          <SlidersHorizontal className="w-3 h-3 mr-1" />
          Filtros Avançados
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <TaskCategoryBadge category={category} className="!p-0 !bg-transparent !border-0" />
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dificuldade */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Dificuldade</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Dificuldades</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={difficulty as any} className="!p-0 !bg-transparent !border-0" />
                        <span>{getDifficultyLabel(difficulty)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Faixa de Pontos */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Faixa de Pontos</label>
              <Select value={selectedPointsRange} onValueChange={setSelectedPointsRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma faixa de pontos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Faixas</SelectItem>
                  <SelectItem value="low">1-25 pontos</SelectItem>
                  <SelectItem value="medium">26-75 pontos</SelectItem>
                  <SelectItem value="high">76+ pontos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Busca: "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Categoria: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {selectedDifficulty !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Dificuldade: {getDifficultyLabel(selectedDifficulty)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDifficulty('all')}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {selectedPointsRange !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Pontos: {getPointsRangeLabel(selectedPointsRange)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPointsRange('all')}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Resultados */}
      <div className="text-sm text-gray-600">
        {filteredTasks.length} de {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} encontrada{filteredTasks.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default TaskSearch;
