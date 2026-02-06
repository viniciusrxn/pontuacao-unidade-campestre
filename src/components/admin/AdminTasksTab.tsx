import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckSquare } from 'lucide-react';
import { Task, TaskSubmission, Unit } from '@/types';
import { DIFFICULTY_OPTIONS, CATEGORY_OPTIONS } from '@/constants';
import DifficultyBadge from '@/components/DifficultyBadge';
import TaskCategoryBadge from '@/components/TaskCategoryBadge';
import TaskOrganizer from '@/components/TaskOrganizer';
import TaskSearch from '@/components/TaskSearch';
import TaskStats from '@/components/TaskStats';
import TaskOverview from '@/components/TaskOverview';

interface Props {
  tasks: Task[];
  submissions: TaskSubmission[];
  units: Unit[];
  onCreateTask: (task: any) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
}

const AdminTasksTab: React.FC<Props> = ({ tasks, submissions, units, onCreateTask, onDeleteTask }) => {
  const [taskActiveTab, setTaskActiveTab] = useState<'create' | 'manage' | 'stats'>('create');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [taskTargetMode, setTaskTargetMode] = useState<'all' | 'selected'>('all');
  const [selectedTaskUnits, setSelectedTaskUnits] = useState<Record<string, boolean>>({});
  const [newTask, setNewTask] = useState({
    title: '', description: '', points: 50,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    difficulty: 'easy' as 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary',
    category: 'geral'
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description || newTask.points <= 0) return;

    const targetUnits = taskTargetMode === 'selected'
      ? Object.entries(selectedTaskUnits).filter(([, sel]) => sel).map(([id]) => id)
      : undefined;

    await onCreateTask({
      title: newTask.title, description: newTask.description, points: newTask.points,
      deadline: new Date(newTask.deadline).toISOString(), difficulty: newTask.difficulty,
      category: newTask.category, targetUnits
    });

    setNewTask({ title: '', description: '', points: 50, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), difficulty: 'easy', category: 'geral' });
    setTaskTargetMode('all');
    setSelectedTaskUnits({});
  };

  return (
    <div className="space-y-6">
      <TaskOverview
        availableTasks={tasks.filter(t => t.status === 'active')}
        pendingTasks={submissions.filter(s => s.status === 'pending').map(s => tasks.find(t => t.id === s.taskId)).filter(Boolean) as Task[]}
        completedTasks={submissions.filter(s => s.status === 'completed').map(s => tasks.find(t => t.id === s.taskId)).filter(Boolean) as Task[]}
      />

      <Card>
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg lg:text-xl">Gerenciamento de Tarefas</CardTitle>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Button variant={taskActiveTab === 'create' ? 'default' : 'outline'} size="sm" onClick={() => setTaskActiveTab('create')} className="text-xs px-2 sm:px-3">Criar</Button>
              <Button variant={taskActiveTab === 'manage' ? 'default' : 'outline'} size="sm" onClick={() => setTaskActiveTab('manage')} className="text-xs px-2 sm:px-3">Gerenciar ({tasks.length})</Button>
              <Button variant={taskActiveTab === 'stats' ? 'default' : 'outline'} size="sm" onClick={() => setTaskActiveTab('stats')} className="text-xs px-2 sm:px-3">Estatisticas</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {taskActiveTab === 'create' && (
            <div className="px-1 sm:px-0">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Criar Nova Tarefa</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm">Titulo da Tarefa</Label>
                    <Input id="title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Digite o titulo da tarefa" required className="text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-sm">Categoria</Label>
                    <Select value={newTask.category} onValueChange={value => setNewTask({ ...newTask, category: value })}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm">Descricao</Label>
                  <Input id="description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Descreva o que precisa ser feito" required className="text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="points" className="text-sm">Pontuacao</Label>
                    <Input id="points" type="number" min="1" max="10000" value={newTask.points} onChange={e => setNewTask({ ...newTask, points: parseInt(e.target.value) || 50 })} required className="text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="difficulty" className="text-sm">Dificuldade</Label>
                    <Select value={newTask.difficulty} onValueChange={(value: any) => setNewTask({ ...newTask, difficulty: value })}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Dificuldade" /></SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deadline" className="text-sm">Prazo</Label>
                    <Input id="deadline" type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} required className="text-sm" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">Direcionamento da Tarefa</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="target-all" name="taskTarget" checked={taskTargetMode === 'all'} onChange={() => setTaskTargetMode('all')} className="w-4 h-4" />
                      <Label htmlFor="target-all" className="text-sm cursor-pointer">Todas as unidades (tarefa global)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="target-selected" name="taskTarget" checked={taskTargetMode === 'selected'} onChange={() => setTaskTargetMode('selected')} className="w-4 h-4" />
                      <Label htmlFor="target-selected" className="text-sm cursor-pointer">Unidades especificas</Label>
                    </div>
                    {taskTargetMode === 'selected' && (
                      <div className="ml-2 sm:ml-6 mt-3 p-3 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Selecione as unidades:</Label>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                          {units.map(unit => (
                            <div key={unit.id} className="flex items-center space-x-2">
                              <Checkbox id={`unit-${unit.id}`} checked={selectedTaskUnits[unit.id] || false} onCheckedChange={(checked) => setSelectedTaskUnits(prev => ({ ...prev, [unit.id]: checked as boolean }))} />
                              <Label htmlFor={`unit-${unit.id}`} className="text-sm cursor-pointer flex-1 break-words">{unit.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-red-600 text-sm" disabled={taskTargetMode === 'selected' && Object.values(selectedTaskUnits).filter(Boolean).length === 0}>
                  {taskTargetMode === 'all' ? 'Criar Tarefa (Todas as Unidades)' : `Criar Tarefa (${Object.values(selectedTaskUnits).filter(Boolean).length} unidades)`}
                </Button>
              </form>
            </div>
          )}

          {taskActiveTab === 'manage' && (
            <div className="space-y-4 px-1 sm:px-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold">Tarefas Existentes ({tasks.length})</h3>
                <Badge variant="outline" className="text-xs self-start sm:self-auto">
                  {tasks.filter(t => t.status === 'active').length} ativas
                </Badge>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <CheckSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">Nenhuma tarefa criada ainda</p>
                  <Button onClick={() => setTaskActiveTab('create')} size="sm" variant="outline">Criar primeira tarefa</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <TaskSearch tasks={tasks} onFilterChange={setFilteredTasks} />
                  <TaskOrganizer
                    tasks={filteredTasks.length > 0 ? filteredTasks : tasks}
                    renderTaskCard={(task) => (
                      <Card key={task.id} className="p-2 sm:p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                              <h4 className="font-medium text-sm sm:text-base break-words min-w-0 flex-1">{task.title}</h4>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                <DifficultyBadge difficulty={task.difficulty || 'easy'} />
                                {task.category && <TaskCategoryBadge category={task.category} />}
                                <Badge variant={task.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                                  {task.status === 'active' ? 'Ativa' : 'Expirada'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">{task.description}</p>
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500">
                              <span>{new Date(task.deadline).toLocaleDateString()}</span>
                              <span>{task.points} pts</span>
                              <span>{submissions.filter(s => s.taskId === task.id && s.status === 'completed').length} aprovadas</span>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={() => onDeleteTask(task.id)} variant="destructive" size="sm" className="text-xs px-2 sm:px-3">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">Remover</span>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          )}

          {taskActiveTab === 'stats' && (
            <div className="space-y-6 px-1 sm:px-0">
              <h3 className="text-base sm:text-lg font-semibold">Estatisticas das Tarefas</h3>
              <TaskStats
                tasks={tasks}
                completedTasks={submissions.filter(s => s.status === 'completed').map(s => tasks.find(t => t.id === s.taskId)).filter(Boolean) as Task[]}
                pendingTasks={submissions.filter(s => s.status === 'pending').map(s => tasks.find(t => t.id === s.taskId)).filter(Boolean) as Task[]}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTasksTab;
