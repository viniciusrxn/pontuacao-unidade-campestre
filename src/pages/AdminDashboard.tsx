import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, Check, X, Award, Shirt, Flag, User, Trash2, Image, Lock, Unlock, Settings, Book, RotateCcw, Newspaper, BarChart3, Users, Info, Inbox, FileText, CheckSquare, BarChart2 } from 'lucide-react';
import { TaskSubmission, WeeklyAttendance } from '@/types';
import UnitDisplay from '@/components/UnitDisplay';
import UnitManagement from '@/components/UnitManagement';
import UnitInfoManager from '@/components/UnitInfoManager';
import AdminNewsManager from '@/components/AdminNewsManager';

import AdminPasswordPrompt from '@/components/AdminPasswordPrompt';
import { useAppContext } from '@/contexts/AppContext';
import { useCommunication } from '@/hooks/useCommunication';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DifficultyBadge, TaskCategoryBadge } from '@/components/Badges';
const AdminDashboard = () => {
  const {
    currentUser,
    units,
    tasks,
    submissions,
    attendances,
    formSettings,
    attendanceFormEnabled,
    createTask,
    deleteTask,
    validateTask,
    updateUnitScore,
    updateUnitLogo,
    validateAttendance,
    toggleAttendanceFormAvailability,
    resetAllStatistics,
    fetchUnits
  } = useAppContext();
  const {
    news
  } = useCommunication();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState("submissions");

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    points: 50,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    difficulty: 'easy' as 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary',
    category: 'geral'
  });

  // Task targeting states
  const [taskTargetMode, setTaskTargetMode] = useState<'all' | 'selected'>('all');
  const [selectedTaskUnits, setSelectedTaskUnits] = useState<Record<string, boolean>>({});

  // Unit score edit state
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});

  // Logo edit state
  const [editingLogos, setEditingLogos] = useState<Record<string, string>>({});

  // Task deletion state
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // Attendance score edit state
  const [editingAttendanceScores, setEditingAttendanceScores] = useState<Record<string, number>>({});



  // Form control states
  const [selectedUnits, setSelectedUnits] = useState<Record<string, boolean>>({});
  const [formControlMode, setFormControlMode] = useState<'all' | 'selected'>('all');

  // Reset statistics state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Redirect if not logged in as admin
  React.useEffect(() => {
    if (!currentUser || currentUser.type !== 'admin') {
      navigate('/admin-login');
    }
  }, [currentUser, navigate]);

  // Initialize selected units based on form settings
  React.useEffect(() => {
    if (formSettings) {
      const newSelectedUnits: Record<string, boolean> = {};
      if (formSettings.enabledUnits && formSettings.enabledUnits.length > 0) {
        setFormControlMode('selected');
        formSettings.enabledUnits.forEach(unitId => {
          newSelectedUnits[unitId] = true;
        });
      } else if (formSettings.isEnabled) {
        setFormControlMode('all');
      }
      setSelectedUnits(newSelectedUnits);
    }
  }, [formSettings]);
  if (!currentUser || currentUser.type !== 'admin') {
    return null;
  }

  // Get pending submissions
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  // Get pending attendance records
  const pendingAttendances = attendances.filter(a => a.status === 'pending');

  // Verify admin password - using the new admin password
  const verifyAdminPassword = (password: string): boolean => {
    // Updated admin password
    return password === '@AdminCampestre';
  };

  // Handle admin password confirmation for reset
  const handleAdminPasswordConfirm = async (password: string) => {
    if (!verifyAdminPassword(password)) {
      toast({
        title: "Senha incorreta",
        description: "A senha do administrador está incorreta.",
        variant: "destructive"
      });
      return;
    }
    setShowAdminPasswordPrompt(false);
    await executeResetStatistics();
  };

  // Execute reset statistics after password confirmation
  const executeResetStatistics = async () => {
    const success = await resetAllStatistics();
    if (success) {
      setShowResetConfirm(false);
      toast({
        title: "Estatísticas resetadas!",
        description: "Todos os dados operacionais foram limpos com sucesso. As unidades permanecem cadastradas.",
        variant: "default"
      });
    } else {
      toast({
        title: "Erro ao resetar",
        description: "Ocorreu um erro ao resetar as estatísticas. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Request admin password before reset
  const requestResetStatistics = () => {
    setShowResetConfirm(false);
    setShowAdminPasswordPrompt(true);
  };

  // Handle form availability toggle
  const handleToggleFormAvailability = async () => {
    let enabledUnitsList: string[] = [];

    // If we're in "selected" mode and the form is about to be enabled,
    // we need to collect the IDs of the selected units
    if (formControlMode === 'selected') {
      enabledUnitsList = Object.entries(selectedUnits).filter(([_, isSelected]) => isSelected).map(([unitId]) => unitId);

      // If no units are selected in selected mode and we're trying to enable, show error
      if (enabledUnitsList.length === 0 && !attendanceFormEnabled) {
        toast({
          title: "Erro ao habilitar formulário",
          description: "Selecione pelo menos uma unidade para habilitar o formulário.",
          variant: "destructive"
        });
        return;
      }
    }
    console.log('Toggling form with mode:', formControlMode, 'units:', enabledUnitsList, 'current status:', attendanceFormEnabled);

    // Toggle the form availability
    const success = await toggleAttendanceFormAvailability(!attendanceFormEnabled, formControlMode === 'selected' ? enabledUnitsList : []);
    if (success) {
      toast({
        title: attendanceFormEnabled ? "Formulário desabilitado" : "Formulário habilitado",
        description: attendanceFormEnabled ? "As unidades não poderão mais enviar presenças." : formControlMode === 'all' ? "Todas as unidades agora podem enviar presenças." : "As unidades selecionadas agora podem enviar presenças.",
        variant: "default"
      });
    }
  };

  // Toggle selection of a unit
  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleCreateTask called');
    console.log('newTask:', newTask);
    console.log('taskTargetMode:', taskTargetMode);
    console.log('selectedTaskUnits:', selectedTaskUnits);
    
    if (!newTask.title || !newTask.description || newTask.points <= 0) {
      toast({
        title: "Falta Informação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    // Get selected unit IDs if targeting specific units
    const targetUnits = taskTargetMode === 'selected' 
      ? Object.entries(selectedTaskUnits)
          .filter(([_, selected]) => selected)
          .map(([unitId, _]) => unitId)
      : undefined;

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      points: newTask.points,
      deadline: new Date(newTask.deadline).toISOString(),
      difficulty: newTask.difficulty,
      category: newTask.category,
      targetUnits
    };
    
    console.log('About to call createTask with:', taskData);
    
    try {
      await createTask(taskData);
      
      // Reset form only if successful
      setNewTask({
        title: '',
        description: '',
        points: 50,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        difficulty: 'easy',
        category: 'geral'
      });
      setTaskTargetMode('all');
      setSelectedTaskUnits({});
      
      const isTargeted = taskTargetMode === 'selected' && targetUnits && targetUnits.length > 0;
      toast({
        title: "Tarefa criada!",
        description: isTargeted 
          ? `Tarefa direcionada criada para ${targetUnits.length} unidade${targetUnits.length !== 1 ? 's' : ''}.`
          : "Tarefa global criada com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error in handleCreateTask:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível criar a tarefa. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
  };
  const handleValidateSubmission = (submission: TaskSubmission, approved: boolean) => {
    validateTask(submission.id, approved);
    toast({
      title: approved ? "Submission approved!" : "Submission rejected",
      description: approved ? "Os pontos foram atribuídos à unidade." : "O formulário foi rejeitado.",
      variant: approved ? "default" : "destructive"
    });
  };
  const handleValidateAttendance = (attendance: WeeklyAttendance, approved: boolean) => {
    // If admin has set a custom score, use it; otherwise use the original score
    const finalScore = editingAttendanceScores[attendance.id] !== undefined 
      ? editingAttendanceScores[attendance.id] 
      : attendance.score;
    
    // Create updated attendance with the final score
    const updatedAttendance = {
      ...attendance,
      score: finalScore
    };
    
    validateAttendance(updatedAttendance.id, approved, finalScore);
    
    // Clean up editing state
    const newEditingScores = { ...editingAttendanceScores };
    delete newEditingScores[attendance.id];
    setEditingAttendanceScores(newEditingScores);
    
    toast({
      title: approved ? "Presença aprovada!" : "Presença rejeitada",
      description: approved ? `O registro foi aprovado e ${finalScore} pontos foram atribuídos à unidade.` : "O registro de presença foi rejeitado.",
      variant: approved ? "default" : "destructive"
    });
  };
  const initScoreEdit = (unit: {
    id: string;
    score: number;
  }) => {
    setEditingScores(prev => ({
      ...prev,
      [unit.id]: unit.score
    }));
  };
  const handleScoreChange = (unitId: string, newScore: number) => {
    setEditingScores(prev => ({
      ...prev,
      [unitId]: newScore
    }));
  };
  const saveScoreChange = (unitId: string) => {
    const newScore = editingScores[unitId];
    if (newScore !== undefined) {
      updateUnitScore(unitId, newScore);

      // Remove from editing state
      const newEditingScores = {
        ...editingScores
      };
      delete newEditingScores[unitId];
      setEditingScores(newEditingScores);
      toast({
        title: "Pontuação atualizada!",
        description: "A pontuação da unidade foi atualizada com sucesso.",
        variant: "default"
      });
    }
  };
  const initLogoEdit = (unit: {
    id: string;
    logo?: string;
  }) => {
    setEditingLogos(prev => ({
      ...prev,
      [unit.id]: unit.logo || ''
    }));
  };
  const handleLogoChange = (unitId: string, newLogo: string) => {
    setEditingLogos(prev => ({
      ...prev,
      [unitId]: newLogo
    }));
  };
  const saveLogoChange = (unitId: string) => {
    const newLogo = editingLogos[unitId];
    if (newLogo !== undefined) {
      updateUnitLogo(unitId, newLogo);

      // Remove from editing state
      const newEditingLogos = {
        ...editingLogos
      };
      delete newEditingLogos[unitId];
      setEditingLogos(newEditingLogos);
      toast({
        title: "Logo atualizado!",
        description: "O logo da unidade foi atualizado com sucesso.",
        variant: "default"
      });
    }
  };

  // Handle attendance score editing
  const initAttendanceScoreEdit = (attendance: WeeklyAttendance) => {
    setEditingAttendanceScores(prev => ({
      ...prev,
      [attendance.id]: attendance.score || 0
    }));
  };

  const handleAttendanceScoreChange = (attendanceId: string, newScore: number) => {
    setEditingAttendanceScores(prev => ({
      ...prev,
      [attendanceId]: newScore
    }));
  };

  const cancelAttendanceScoreEdit = (attendanceId: string) => {
    const newEditingScores = { ...editingAttendanceScores };
    delete newEditingScores[attendanceId];
    setEditingAttendanceScores(newEditingScores);
  };

  // Handle task deletion
  const confirmDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };
  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
      toast({
        title: "Tarefa deletada",
        description: "A tarefa foi removida permanentemente.",
        variant: "default"
      });
    }
  };

  // Helper to get unit and task info
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown Unit';
  };
  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };
  const getTaskPoints = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.points : 0;
  };

  // Fixed refresh function - instead of reloading the page, refresh units data
  const handleUnitsRefresh = async () => {
    try {
      if (fetchUnits) {
        await fetchUnits();
      }
      // Stay on the admin dashboard, specifically on the unit-management tab
      setActiveTab("unit-management");
    } catch (error) {
      console.error('Error refreshing units:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados das unidades.",
        variant: "destructive"
      });
    }
  };
  return <Layout>
      <div className="w-full px-2 sm:px-4 md:max-w-5xl md:mx-auto">
        <div className="mb-4 sm:mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Menu Admin</h1>
              <p className="text-sm sm:text-base text-gray-600">Gerencie tarefas, comunicação e revise envios</p>
            </div>
            <Button onClick={() => setShowResetConfirm(true)} variant="destructive" size="sm" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              🔴 Resetar Estatísticas
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4 p-4 bg-white rounded-xl shadow-sm">
            <TabsTrigger value="submissions" onClick={() => scrollToSection("submissions")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <Inbox className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Envios</span>
              {pendingSubmissions.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs py-0.5 px-1.5 rounded-full">
                  {pendingSubmissions.length}
                </span>}
            </TabsTrigger>
            <TabsTrigger value="attendances" onClick={() => scrollToSection("attendances")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <FileText className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Forms</span>
              {pendingAttendances.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs py-0.5 px-1.5 rounded-full">
                  {pendingAttendances.length}
                </span>}
            </TabsTrigger>
            <TabsTrigger value="news" onClick={() => scrollToSection("news")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <Newspaper className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Notícias</span>
            </TabsTrigger>

            <TabsTrigger value="tasks" onClick={() => scrollToSection("tasks")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <CheckSquare className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Tarefas</span>
            </TabsTrigger>
            <TabsTrigger value="units" onClick={() => scrollToSection("units")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <BarChart2 className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Pontuação</span>
            </TabsTrigger>
            <TabsTrigger value="logos" onClick={() => scrollToSection("logos")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <Image className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Logos</span>
            </TabsTrigger>
            <TabsTrigger value="unit-management" onClick={() => scrollToSection("unit-management")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Unidades</span>
            </TabsTrigger>
            <TabsTrigger value="unit-info" onClick={() => scrollToSection("unit-info")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <Info className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Info Unidades</span>
            </TabsTrigger>
            <TabsTrigger value="form-control" onClick={() => scrollToSection("form-control")} className="flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95 active:bg-gray-100">
              <Settings className="w-6 h-6" />
              <span className="text-xs font-medium text-center">Controle</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Pending Submissions Tab */}
          <TabsContent value="submissions" id="submissions" className="mt-6">
            {pendingSubmissions.length === 0 ? <div className="text-center py-6 sm:py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Não há envios pendentes para análise.</p>
              </div> : <div className="space-y-4">
                {pendingSubmissions.map(submission => <Card key={submission.id}>
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="flex justify-between text-base sm:text-lg">
                        <span className="truncate mr-2">{getTaskName(submission.taskId)}</span>
                        <span className="text-success whitespace-nowrap">{getTaskPoints(submission.taskId)} pts</span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="truncate">Enviado por: <strong>{getUnitName(submission.unitId)}</strong></span>
                          <span className="whitespace-nowrap">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="mb-4">
                        <h3 className="font-medium mb-2 text-sm sm:text-base">Prova de envio:</h3>
                        <div className="p-2 sm:p-4 bg-gray-50 rounded-lg text-xs sm:text-sm">
                          {submission.proof}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 justify-end">
                        <Button onClick={() => handleValidateSubmission(submission, true)} className="bg-success text-white text-xs sm:text-sm px-2 sm:px-3" size="sm">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Aprovar
                        </Button>
                        <Button onClick={() => handleValidateSubmission(submission, false)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3" size="sm">
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Rejeitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>
          
          {/* Attendance Forms Tab */}
          <TabsContent value="attendances" id="attendances" className="mt-6">
            {pendingAttendances.length === 0 ? <div className="text-center py-6 sm:py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Sem formulários pendentes para revisão.</p>
              </div> : <div className="space-y-4">
                {pendingAttendances.map(attendance => <Card key={attendance.id}>
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="flex justify-between text-base sm:text-lg">
                        <span className="truncate mr-2">Presença: {getUnitName(attendance.unitId)}</span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="truncate">Data: <strong>
                            {new Date(attendance.date).toLocaleDateString()}
                          </strong></span>
                          <span className="whitespace-nowrap">
                            Enviado: {new Date(attendance.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                          <div>
                            <h3 className="font-medium mb-2 text-sm sm:text-base">Detalhes de Presença:</h3>
                            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                <span>Membros presentes: {attendance.presentMembers.length}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                                <span>Membros pontuais: {attendance.punctualCount}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                                <span>Com lenço: {attendance.neckerchiefCount}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Shirt className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                <span>Uniformizados: {attendance.uniformCount}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                <span>Bandeirim: {attendance.broughtFlag ? 'Sim' : 'Não'}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Book className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                                <span>Bíblia: {attendance.broughtBible ? 'Sim' : 'Não'}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-2 text-sm sm:text-base">Membros Presentes:</h3>
                            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg max-h-32 sm:max-h-40 overflow-y-auto">
                              {attendance.presentMembers.length > 0 ? <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                                  {attendance.presentMembers.map((member, idx) => <li key={idx}>{member}</li>)}
                                </ul> : <p className="text-xs sm:text-sm text-gray-500">Nenhum membro listado</p>}
                            </div>
                          </div>
                        </div>

                        {/* Score editing section */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Pontuação da Presença</h4>
                            <span className="text-sm text-gray-600">
                              Atual: {editingAttendanceScores[attendance.id] !== undefined ? editingAttendanceScores[attendance.id] : attendance.score} pontos
                            </span>
                          </div>
                          
                          {editingAttendanceScores[attendance.id] !== undefined ? (
                            <div className="flex gap-2 items-center">
                              <Input
                                type="number"
                                min="0"
                                className="w-20 text-sm"
                                value={editingAttendanceScores[attendance.id]}
                                onChange={(e) => handleAttendanceScoreChange(attendance.id, parseInt(e.target.value) || 0)}
                                placeholder="0"
                              />
                              <span className="text-sm text-gray-600">pontos</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelAttendanceScoreEdit(attendance.id)}
                                className="text-xs"
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => initAttendanceScoreEdit(attendance)}
                              className="text-xs"
                            >
                              Definir Pontuação
                            </Button>
                          )}
                        </div>

                      </div>
                      <div className="flex gap-2 sm:gap-3 justify-end">
                        <Button onClick={() => handleValidateAttendance(attendance, true)} className="bg-success text-white text-xs sm:text-sm px-2 sm:px-3" size="sm">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Aprovar
                        </Button>
                        <Button onClick={() => handleValidateAttendance(attendance, false)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3" size="sm">
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Rejeitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>
          
          {/* Manage Tasks Tab */}
          <TabsContent value="tasks" id="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Criar Nova Tarefa</CardTitle>
                <CardDescription>Adicione uma nova tarefa para as unidades completarem</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título da Tarefa</Label>
                      <Input id="title" value={newTask.title} onChange={e => setNewTask({
                      ...newTask,
                      title: e.target.value
                    })} placeholder="Digite o título da tarefa" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={newTask.category} onValueChange={value => setNewTask({
                      ...newTask,
                      category: value
                    })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="estudo">Estudo</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="espiritual">Espiritual</SelectItem>
                          <SelectItem value="atividade">Atividade</SelectItem>
                          <SelectItem value="missao">Missão</SelectItem>
                          <SelectItem value="comunidade">Comunidade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" value={newTask.description} onChange={e => setNewTask({
                    ...newTask,
                    description: e.target.value
                  })} placeholder="Descreva o que precisa ser feito" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="points">Pontuação</Label>
                      <Input id="points" type="number" min="1" max="10000" value={newTask.points} onChange={e => setNewTask({
                      ...newTask,
                      points: parseInt(e.target.value) || 50
                    })} required />
                    </div>
                    
                    <div>
                      <Label htmlFor="difficulty">Dificuldade</Label>
                      <Select value={newTask.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary') => setNewTask({
                      ...newTask,
                      difficulty: value
                    })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Dificuldade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Fácil (Azul)</SelectItem>
                          <SelectItem value="medium">Médio (Verde)</SelectItem>
                          <SelectItem value="hard">Difícil (Vermelho)</SelectItem>
                          <SelectItem value="very_hard">Muito Difícil (Cinza)</SelectItem>
                          <SelectItem value="legendary">Lendário (Amarelo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="deadline">Prazo</Label>
                      <Input id="deadline" type="date" value={newTask.deadline} onChange={e => setNewTask({
                      ...newTask,
                      deadline: e.target.value
                    })} required />
                    </div>
                  </div>

                  {/* Task Targeting Section */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-3 block">Direcionamento da Tarefa</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="target-all"
                          name="taskTarget"
                          checked={taskTargetMode === 'all'}
                          onChange={() => setTaskTargetMode('all')}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="target-all" className="text-sm">
                          Todas as unidades (tarefa global)
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="target-selected"
                          name="taskTarget"
                          checked={taskTargetMode === 'selected'}
                          onChange={() => setTaskTargetMode('selected')}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="target-selected" className="text-sm">
                          Unidades específicas
                        </Label>
                      </div>
                      
                      {taskTargetMode === 'selected' && (
                        <div className="ml-6 mt-3 p-3 bg-gray-50 rounded-lg">
                          <Label className="text-sm font-medium mb-2 block">
                            Selecione as unidades:
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {units.map(unit => (
                              <div key={unit.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`unit-${unit.id}`}
                                  checked={selectedTaskUnits[unit.id] || false}
                                  onCheckedChange={(checked) => 
                                    setSelectedTaskUnits(prev => ({
                                      ...prev,
                                      [unit.id]: checked as boolean
                                    }))
                                  }
                                />
                                <Label 
                                  htmlFor={`unit-${unit.id}`} 
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {unit.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {taskTargetMode === 'selected' && Object.values(selectedTaskUnits).filter(Boolean).length === 0 && (
                            <p className="text-xs text-orange-600 mt-2">
                              ⚠️ Selecione pelo menos uma unidade
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary"
                    disabled={taskTargetMode === 'selected' && Object.values(selectedTaskUnits).filter(Boolean).length === 0}
                  >
                    {taskTargetMode === 'all' 
                      ? 'Criar Tarefa (Todas as Unidades)' 
                      : `Criar Tarefa (${Object.values(selectedTaskUnits).filter(Boolean).length} unidade${Object.values(selectedTaskUnits).filter(Boolean).length !== 1 ? 's' : ''})`
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Existing Tasks List */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Tarefas Existentes</h3>
              {tasks.length === 0 ? <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Nenhuma tarefa criada ainda.</p>
                </div> : <div className="space-y-3">
                  {tasks.map(task => <Card key={task.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm sm:text-base">{task.title}</h4>
                            <DifficultyBadge difficulty={task.difficulty || 'easy'} />
                            {task.category && <TaskCategoryBadge category={task.category} />}
                            {task.targetUnits && task.targetUnits.length > 0 && (
                              <span 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-help"
                                title={`Direcionada para: ${task.targetUnits.map(unitId => units.find(u => u.id === unitId)?.name || 'Unidade não encontrada').join(', ')}`}
                              >
                                🎯 {task.targetUnits.length} unidade{task.targetUnits.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {(!task.targetUnits || task.targetUnits.length === 0) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                🌐 Todas
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-500">
                            <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                            <span>⭐ {task.points} pontos</span>
                            <span className={task.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                              {task.status === 'active' ? '✅ Ativa' : '❌ Expirada'}
                            </span>
                          </div>
                        </div>
                        <Button onClick={() => confirmDeleteTask(task.id)} variant="destructive" size="sm" className="self-end sm:self-start">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>)}
                </div>}
            </div>
          </TabsContent>
          
          {/* Manage Units Tab */}
          <TabsContent value="units" id="units" className="mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Gestão de Unidade</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Visualize e atualize informações e pontuações da unidade
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-3 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Unidade</TableHead>
                      <TableHead className="text-xs">Pontos</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Tarefas</TableHead>
                      <TableHead className="text-xs">Editar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.map(unit => <TableRow key={unit.id}>
                        <TableCell className="py-2">
                          <UnitDisplay name={unit.name} logo={unit.logo} className="text-xs" />
                        </TableCell>
                        <TableCell className="py-2">
                          {editingScores[unit.id] !== undefined ? <Input type="number" className="w-16 sm:w-24 text-xs" value={editingScores[unit.id]} onChange={e => handleScoreChange(unit.id, parseInt(e.target.value) || 0)} /> : <div className="flex items-center">
                              <Award className="w-3 h-3 mr-1 text-yellow-500" />
                              <span className="text-xs">{unit.score}</span>
                            </div>}
                        </TableCell>
                        <TableCell className="py-2 hidden sm:table-cell">
                          <span className="text-xs">{unit.tasks.length}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          {editingScores[unit.id] !== undefined ? <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <Button size="sm" onClick={() => saveScoreChange(unit.id)} className="bg-success text-white h-7 text-xs px-2">
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                          const newEditingScores = {
                            ...editingScores
                          };
                          delete newEditingScores[unit.id];
                          setEditingScores(newEditingScores);
                        }} className="text-xs sm:text-sm">
                                Cancelar
                              </Button>
                            </div> : <Button size="sm" variant="outline" onClick={() => initScoreEdit(unit)} className="h-7 text-xs px-2">
                              Editar
                            </Button>}
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Logos Management Tab */}
          <TabsContent value="logos" id="logos" className="mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Gerenciamento de logos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Atualize o logo da unidade com URLs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {units.map(unit => <div key={unit.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          <UnitDisplay name={unit.name} logo={editingLogos[unit.id] || unit.logo} size="md" />
                        </div>
                        <div className="flex-grow space-y-2 sm:space-y-3">
                          {editingLogos[unit.id] !== undefined ? <>
                              <Label htmlFor={`logo-${unit.id}`} className="text-xs sm:text-sm">Logo URL:</Label>
                              <Input id={`logo-${unit.id}`} value={editingLogos[unit.id]} onChange={e => handleLogoChange(unit.id, e.target.value)} placeholder="Enter image URL for logo" className="w-full text-xs sm:text-sm" />
                              <div className="text-xs text-gray-500 italic">
                                Deixe em branco para usar o logotipo padrão
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button onClick={() => saveLogoChange(unit.id)} size="sm" className="bg-success text-white h-7 text-xs px-2">
                                  Salvar
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                            const newEditingLogos = {
                              ...editingLogos
                            };
                            delete newEditingLogos[unit.id];
                            setEditingLogos(newEditingLogos);
                          }} className="h-7 text-xs px-2">
                                  Cancelar
                                </Button>
                              </div>
                            </> : <Button onClick={() => initLogoEdit(unit)} variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 h-7 text-xs px-2">
                              <Image className="w-3 h-3 sm:w-4 sm:h-4" />
                              Alterar logo
                            </Button>}
                        </div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Unit Management Tab */}
          <TabsContent value="unit-management" id="unit-management" className="mt-6">
            <UnitManagement units={units} onUnitsUpdate={handleUnitsRefresh} />
          </TabsContent>
          
          {/* Unit Info Tab */}
          <TabsContent value="unit-info" id="unit-info" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Informações das Unidades
                  </CardTitle>
                  <CardDescription>
                    Visualize e gerencie as informações detalhadas de cada unidade
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {units.map(unit => <Card key={unit.id}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <UnitDisplay name={unit.name} logo={unit.logo} size="md" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UnitInfoManager unitId={unit.id} />
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>
          
          {/* Form Control Tab */}
          <TabsContent value="form-control" id="form-control" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Controle de Cantinho da Unidade</span>
                  <Button onClick={handleToggleFormAvailability} size="sm" variant={attendanceFormEnabled ? "destructive" : "default"} className="flex gap-2 items-center">
                    {attendanceFormEnabled ? <><Lock className="h-4 w-4" /> Desabilitar</> : <><Unlock className="h-4 w-4" /> Habilitar</>}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Gerencie a disponibilidade do formulário de presença semanal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">Formulário de Presença Semanal</h3>
                        <p className="text-sm text-gray-600">
                          Status: {attendanceFormEnabled ? <span className="text-green-600 font-medium">Habilitado</span> : <span className="text-red-600 font-medium">Desabilitado</span>}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Switch checked={attendanceFormEnabled} onCheckedChange={() => handleToggleFormAvailability()} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Configurações de Acesso</h3>
                    <div className="flex gap-2 items-center text-sm">
                      <button onClick={() => setFormControlMode('all')} className={`px-2 py-1 rounded ${formControlMode === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                        Todas as unidades
                      </button>
                      <button onClick={() => setFormControlMode('selected')} className={`px-2 py-1 rounded ${formControlMode === 'selected' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                        Unidades Específicas
                      </button>
                    </div>
                  </div>
                  
                  {formControlMode === 'selected' && <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="mb-3 font-medium">Selecione as unidades que podem acessar o formulário:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {units.map(unit => <div key={unit.id} className={`flex items-center justify-between p-2 rounded border ${selectedUnits[unit.id] ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                            <UnitDisplay name={unit.name} logo={unit.logo} size="sm" />
                            <Checkbox checked={selectedUnits[unit.id] || false} onCheckedChange={() => toggleUnitSelection(unit.id)} />
                          </div>)}
                      </div>
                    </div>}
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button onClick={handleToggleFormAvailability} variant={attendanceFormEnabled ? "destructive" : "default"} className="w-full">
                      {attendanceFormEnabled ? 'Desabilitar Acesso ao Formulário' : 'Habilitar Acesso ao Formulário'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* News Management Tab */}
          <TabsContent value="news" id="news" className="mt-6">
            <AdminNewsManager news={news} />
          </TabsContent>
          

        </Tabs>
      </div>

      {/* Reset Statistics Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg text-red-600">
              🔴 Resetar Todas as Estatísticas
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              <div className="space-y-2">
                <p><strong>Esta ação irá DELETAR PERMANENTEMENTE:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-red-600">
                  <li>Todas as tarefas criadas</li>
                  <li>Todos os envios de tarefas</li>
                  <li>Todo o histórico de presenças</li>
                  <li>Formulários pendentes</li>
                  <li>Pontuações de todas as unidades</li>
                </ul>
                <p className="mt-3"><strong>As unidades permanecerão cadastradas.</strong></p>
                <p className="text-red-700 font-medium">Esta ação NÃO PODE ser desfeita!</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="text-xs sm:text-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={requestResetStatistics} className="bg-destructive text-destructive-foreground text-xs sm:text-sm">
              🔥 Confirmar Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Password Prompt for Reset */}
      <AdminPasswordPrompt isOpen={showAdminPasswordPrompt} onClose={() => setShowAdminPasswordPrompt(false)} onConfirm={handleAdminPasswordConfirm} title="Confirmar Reset das Estatísticas" description="Digite sua senha de administrador para confirmar o reset de todas as estatísticas do sistema." actionText="🔥 Resetar Estatísticas" isDestructive={true} />

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => taskToDelete && setTaskToDelete(null)}>
        <AlertDialogContent className="max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Apagar tarefa</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Tem certeza de que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
              Todos os envios relacionados também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="text-xs sm:text-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground text-xs sm:text-sm">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>;
};
export default AdminDashboard;