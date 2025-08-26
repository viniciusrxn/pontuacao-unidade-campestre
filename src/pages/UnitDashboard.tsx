import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '../contexts/AppContext';
import { useCommunication } from '../hooks/useCommunication';
import { useToast } from '@/components/ui/use-toast';
import { Award, Check, Clock, CalendarDays, X, ChevronDown, ChevronUp, Newspaper, BarChart3, Info, ListTodo, Eye, CheckCircle2, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Task } from '../types';
import UnitDisplay from '@/components/UnitDisplay';
import UnitLogo from '@/components/UnitLogo';
import DifficultyBadge from '@/components/DifficultyBadge';
import TaskCategoryBadge from '@/components/TaskCategoryBadge';
import UnitProgress from '@/components/UnitProgress';
import NewsFeed from '@/components/NewsFeed';

import UnitInfoManager from '@/components/UnitInfoManager';
import TaskOrganizer from '@/components/TaskOrganizer';
import TaskStats from '@/components/TaskStats';
import TaskSearch from '@/components/TaskSearch';
import TaskOverview from '@/components/TaskOverview';

const UnitDashboard = () => {
  const { currentUser, units, tasks, submissions, submitTask, getTasksForUnit, getTasksWithHistoryForUnit } = useAppContext();
  const { news } = useCommunication();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("available");
  const [submissionProof, setSubmissionProof] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNews, setShowNews] = useState(true);
  const [filteredAvailableTasks, setFilteredAvailableTasks] = useState<Task[]>([]);
  const [filteredPendingTasks, setFilteredPendingTasks] = useState<Task[]>([]);
  const [filteredCompletedTasks, setFilteredCompletedTasks] = useState<Task[]>([]);
  
  // Estados para tarefas com histórico preservado
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);


  // Redireciona se não estiver logado como unidade
  React.useEffect(() => {
    if (!currentUser || currentUser.type !== 'unit') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Carregar tarefas com histórico preservado
  React.useEffect(() => {
    const loadTasksWithHistory = async () => {
      if (currentUser?.type === 'unit' && currentUser.unitId) {
        try {
          const tasksData = await getTasksWithHistoryForUnit(currentUser.unitId);
          setAvailableTasks(tasksData.available);
          setPendingTasks(tasksData.pending);
          setCompletedTasks(tasksData.completed);
        } catch (error) {
          console.error('Error loading tasks with history:', error);
          // Fallback para método antigo se houver erro
          const currentUnit = units.find(unit => unit.id === currentUser.unitId);
          if (currentUnit) {
            const unitSubmissions = submissions.filter(s => s.unitId === currentUnit.id);
            const completedTaskIds = new Set(unitSubmissions
              .filter(s => s.status === 'completed')
              .map(s => s.taskId));
            const pendingTaskIds = new Set(unitSubmissions
              .filter(s => s.status === 'pending')
              .map(s => s.taskId));
            
            const unitAvailableTasks = getTasksForUnit(currentUnit.id);
            
            setAvailableTasks(unitAvailableTasks.filter(task => 
              task.status === 'active' && 
              !completedTaskIds.has(task.id) &&
              !pendingTaskIds.has(task.id)
            ));
            setPendingTasks(unitAvailableTasks.filter(task => pendingTaskIds.has(task.id)));
            setCompletedTasks(unitAvailableTasks.filter(task => completedTaskIds.has(task.id)));
          }
        }
      }
    };

    loadTasksWithHistory();
  }, [currentUser, units, submissions, tasks, getTasksForUnit, getTasksWithHistoryForUnit]);

  if (!currentUser || currentUser.type !== 'unit') {
    return null;
  }

  const currentUnit = units.find(unit => unit.id === currentUser.unitId);
  if (!currentUnit) return null;

  // Obtém as submissões da unidade para uso em funções auxiliares
  const unitSubmissions = submissions.filter(s => s.unitId === currentUnit.id);

  const handleTaskSubmission = () => {
    if (!selectedTaskId || !submissionProof.trim()) {
      toast({
        title: "Informações ausentes",
        description: "Por favor, forneça uma prova de conclusão da tarefa.",
        variant: "destructive",
      });
      return;
    }
    
    submitTask(selectedTaskId, submissionProof);
    setSubmissionProof("");
    setSelectedTaskId(null);
    
    toast({
      title: "Tarefa enviada!",
      description: "Sua tarefa foi enviada para revisão.",
      variant: "default",
    });
  };

  const getTaskSubmission = (taskId: string) => {
    return unitSubmissions.find(s => s.taskId === taskId);
  };

  const renderTaskCard = (task: Task) => {
    const submission = getTaskSubmission(task.id);
    
    // Get difficulty border color
    const getDifficultyBorderColor = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return 'border-l-blue-500';
        case 'medium': return 'border-l-green-500';
        case 'hard': return 'border-l-red-400';
        case 'very_hard': return 'border-l-gray-700';
        case 'legendary': return 'border-l-yellow-500';
        default: return 'border-l-blue-500';
      }
    };
    
    return (
      <Card key={task.id} className={`mb-4 border-l-4 ${getDifficultyBorderColor(task.difficulty || 'easy')}`}>
        <CardHeader className="pb-2 pt-3 px-3 md:pb-3 md:pt-4 md:px-6">
          <CardTitle className="flex justify-between text-base md:text-xl flex-wrap gap-1">
            <span>{task.title}</span>
            <span className="text-success whitespace-nowrap">{task.points} pts</span>
          </CardTitle>
          <div className="flex flex-wrap gap-2 items-center">
            <DifficultyBadge difficulty={task.difficulty || 'easy'} />
            {task.category && <TaskCategoryBadge category={task.category} />}
          </div>
          <CardDescription>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Clock className="w-3 h-3 md:w-4 md:h-4" /> 
              <span>Prazo: {new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6 py-2">
          <p className="mb-2 text-sm md:text-base">{task.description}</p>
          
          {submission && (
            <div className="mt-3 p-2 md:p-3 bg-gray-50 rounded-lg text-sm md:text-base">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div className="font-medium">Status da Submissão:</div>
                {submission.status === 'pending' && (
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 md:px-3 rounded-full text-xs md:text-sm flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" /> Aguardando Revisão
                  </div>
                )}
                {submission.status === 'completed' && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 md:px-3 rounded-full text-xs md:text-sm flex items-center gap-1 w-fit">
                    <Check className="w-3 h-3 md:w-4 md:h-4" /> Aprovado
                  </div>
                )}
                {submission.status === 'rejected' && (
                  <div className="bg-red-100 text-red-800 px-2 py-1 md:px-3 rounded-full text-xs md:text-sm flex items-center gap-1 w-fit">
                    <X className="w-3 h-3 md:w-4 md:h-4" /> Rejeitado
                  </div>
                )}
              </div>
              {submission.proof && (
                <div className="mt-2">
                  <div className="font-medium">Sua prova:</div>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{submission.proof}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        {activeTab === "available" && (
          <CardFooter className="px-3 md:px-6 py-2 md:py-3">
            {selectedTaskId === task.id ? (
              <div className="w-full space-y-3">
                <textarea
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-md text-sm md:text-base"
                  rows={3}
                  value={submissionProof}
                  onChange={(e) => setSubmissionProof(e.target.value)}
                  placeholder="Descreva como você completou a tarefa (ou adicione um link para sua evidência em foto/vídeo)"
                />
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={handleTaskSubmission} 
                    className="bg-success text-white text-sm md:text-base"
                    size={isMobile ? "sm" : "default"}
                  >
                    Enviar Tarefa
                  </Button>
                  <Button 
                    onClick={() => setSelectedTaskId(null)} 
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className="text-sm md:text-base"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => setSelectedTaskId(task.id)} 
                className="bg-primary text-white text-sm md:text-base"
                size={isMobile ? "sm" : "default"}
              >
                Completar Esta Tarefa
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-[#E30613] to-[#2B58A2] text-white px-4 py-3 rounded-2xl shadow-md hover:scale-105 transition-transform duration-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 items-center">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <UnitLogo 
                  name={currentUnit.name} 
                  logo={currentUnit.logo} 
                  size="lg" 
                />
                <div className="text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold">{currentUnit.name}</h1>
                  <p className="text-base md:text-lg font-normal opacity-90">Painel da Unidade</p>
                </div>
              </div>
              <div className="flex items-center bg-white/20 py-1 px-4 md:py-2 md:px-6 rounded-full">
                <Award className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-300" />
                <span className="text-xl md:text-2xl font-bold">{currentUnit.score} Pontos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Progress Section */}
        <div className="mb-6">
          <UnitProgress 
            completedTasks={completedTasks.length}
            totalTasks={tasks.length}
            totalPoints={currentUnit.score}
          />
        </div>

        {/* Seção para presença semanal */}
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                Cantinho da Unidade
              </CardTitle>
              <CardDescription>Registre a presença da sua unidade aos sábados para ganhar pontos</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <Link to="/weekly-attendance" className="w-full md:w-auto">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size={isMobile ? "sm" : "default"}>
                    Registrar Presença de Hoje
                  </Button>
                </Link>
                <Link to="/weekly-attendance-history" className="w-full md:w-auto">
                  <Button variant="outline" className="w-full" size={isMobile ? "sm" : "default"}>
                    Ver Histórico de Presenças
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Overview Section - movido para baixo dos botões */}

        {/* Seção de Notícias - com opção de esconder */}
        {news.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                Feed de Notícias
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNews(!showNews)}
                className="flex items-center gap-1"
              >
                {showNews ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showNews ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
            {showNews && <NewsFeed news={news} />}
          </div>
        )}

        <Tabs defaultValue="available" className="mb-4 md:mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full gap-2 p-1 bg-white rounded-xl shadow-sm">
            <TabsTrigger 
              value="available" 
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-2 text-[10px] md:text-xs min-h-[56px] md:min-h-[50px] rounded-lg border border-gray-200 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-colors"
            >
              <ListTodo className="w-5 h-5" />
              <span className="font-medium">Disponíveis</span>
              {availableTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] leading-none py-0.5 px-1.5 rounded-full font-bold">
                  {availableTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-2 text-[10px] md:text-xs min-h-[56px] md:min-h-[50px] rounded-lg border border-gray-200 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">Em Revisão</span>
              {pendingTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] leading-none py-0.5 px-1.5 rounded-full font-bold">
                  {pendingTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-2 text-[10px] md:text-xs min-h-[56px] md:min-h-[50px] rounded-lg border border-gray-200 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Concluídas</span>
              {completedTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] leading-none py-0.5 px-1.5 rounded-full font-bold">
                  {completedTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-2 text-[10px] md:text-xs min-h-[56px] md:min-h-[50px] rounded-lg border border-gray-200 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Estatísticas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="info" 
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-2 text-[10px] md:text-xs min-h-[56px] md:min-h-[50px] rounded-lg border border-gray-200 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="font-medium">Informações</span>
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral movida para aba Estatísticas */}
          
          <TabsContent value="available" className="mt-3 md:mt-4">
            {availableTasks.length === 0 ? (
              <div className="text-center py-6 md:py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm md:text-base">Sem tarefas disponíveis no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <TaskSearch
                  tasks={availableTasks}
                  onFilterChange={setFilteredAvailableTasks}
                />
                <TaskOrganizer
                  tasks={filteredAvailableTasks.length > 0 ? filteredAvailableTasks : availableTasks}
                  renderTaskCard={renderTaskCard}
                  className="mt-4"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-3 md:mt-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 md:py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm md:text-base">Não há tarefas pendentes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <TaskSearch
                  tasks={pendingTasks}
                  onFilterChange={setFilteredPendingTasks}
                />
                <TaskOrganizer
                  tasks={filteredPendingTasks.length > 0 ? filteredPendingTasks : pendingTasks}
                  renderTaskCard={renderTaskCard}
                  className="mt-4"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-3 md:mt-4">
            {completedTasks.length === 0 ? (
              <div className="text-center py-6 md:py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm md:text-base">Você ainda não completou nenhuma tarefa.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <TaskSearch
                  tasks={completedTasks}
                  onFilterChange={setFilteredCompletedTasks}
                />
                <TaskOrganizer
                  tasks={filteredCompletedTasks.length > 0 ? filteredCompletedTasks : completedTasks}
                  renderTaskCard={renderTaskCard}
                  className="mt-4"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-3 md:mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Visão Geral das Tarefas
                </h3>
                <TaskOverview
                  availableTasks={availableTasks}
                  pendingTasks={pendingTasks}
                  completedTasks={completedTasks}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas das Tarefas
                </h3>
                <TaskStats
                  tasks={[...availableTasks, ...pendingTasks, ...completedTasks]}
                  completedTasks={completedTasks}
                  pendingTasks={pendingTasks}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-3 md:mt-4">
            <div className="space-y-6">
              <UnitInfoManager unitId={currentUnit.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UnitDashboard;
