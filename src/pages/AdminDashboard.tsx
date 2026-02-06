import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, RotateCcw, Newspaper, BarChart3, Users, Info, Inbox, FileText, CheckSquare, BarChart2, TrendingUp, Settings, Image } from 'lucide-react';
import { TaskSubmission, WeeklyAttendance } from '@/types';
import UnitManagement from '@/components/UnitManagement';
import UnitInfoManager from '@/components/UnitInfoManager';
import AdminNewsManager from '@/components/AdminNewsManager';
import AdminPasswordPrompt from '@/components/AdminPasswordPrompt';
import { useAppContext } from '@/contexts/AppContext';
import { useCommunication } from '@/hooks/useCommunication';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnitDisplay from '@/components/UnitDisplay';
import AdminSubmissionsTab from '@/components/admin/AdminSubmissionsTab';
import AdminAttendancesTab from '@/components/admin/AdminAttendancesTab';
import AdminTasksTab from '@/components/admin/AdminTasksTab';
import AdminScoresTab from '@/components/admin/AdminScoresTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import AdminStatsTab from '@/components/admin/AdminStatsTab';
import AdminSystemTab from '@/components/admin/AdminSystemTab';

const AdminDashboard = () => {
  const {
    currentUser, units, tasks, submissions, attendances,
    formSettings, attendanceFormEnabled, rankingVisible,
    createTask, deleteTask, validateTask, updateUnitScore, updateUnitLogo,
    validateAttendance, toggleAttendanceFormAvailability, toggleRankingVisibility,
    resetAllStatistics, fetchUnits
  } = useAppContext();
  const { news } = useCommunication();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("submissions");
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);

  React.useEffect(() => {
    if (!currentUser || currentUser.type !== 'admin') {
      navigate('/admin-login');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.type !== 'admin') return null;

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const pendingAttendances = attendances.filter(a => a.status === 'pending');

  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin', { username_param: 'admin', password_param: password });
      if (error) return false;
      return (data as unknown as { success: boolean }).success;
    } catch { return false; }
  };

  const handleAdminPasswordConfirm = async (password: string) => {
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      toast({ title: "Senha incorreta", description: "A senha do administrador esta incorreta.", variant: "destructive" });
      return;
    }
    setShowAdminPasswordPrompt(false);
    const success = await resetAllStatistics();
    toast(success
      ? { title: "Estatisticas resetadas!", description: "Todos os dados operacionais foram limpos com sucesso." }
      : { title: "Erro ao resetar", description: "Ocorreu um erro ao resetar as estatisticas.", variant: "destructive" }
    );
  };

  const handleValidateSubmission = (submission: TaskSubmission, approved: boolean, feedback?: string) => {
    validateTask(submission.id, approved, feedback);
    toast({
      title: approved ? "Envio aprovado!" : "Envio rejeitado",
      description: approved ? "Os pontos foram atribuidos a unidade." : "O formulario foi rejeitado.",
      variant: approved ? "default" : "destructive"
    });
  };

  const handleValidateAttendance = (attendance: WeeklyAttendance, approved: boolean, customScore?: number, feedback?: string) => {
    validateAttendance(attendance.id, approved, customScore, feedback);
    toast({
      title: approved ? "Presenca aprovada!" : "Presenca rejeitada",
      description: approved ? `Registro aprovado com ${customScore ?? attendance.score} pontos.` : "O registro de presenca foi rejeitado.",
      variant: approved ? "default" : "destructive"
    });
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      toast({ title: "Tarefa criada!", description: "Tarefa criada com sucesso." });
    } catch {
      toast({ title: "Erro ao criar tarefa", description: "Nao foi possivel criar a tarefa.", variant: "destructive" });
      throw new Error('Failed to create task');
    }
  };

  const confirmDeleteTask = (taskId: string) => setTaskToDelete(taskId);

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete);
      setTaskToDelete(null);
      toast({ title: "Tarefa processada", description: "A tarefa foi removida com sucesso." });
    } catch {
      toast({ title: "Erro ao processar tarefa", description: "Ocorreu um erro.", variant: "destructive" });
    }
  };

  const handleToggleFormAvailability = async () => {
    const success = await toggleAttendanceFormAvailability(!attendanceFormEnabled);
    if (success) toast({ title: attendanceFormEnabled ? "Formulario desabilitado" : "Formulario habilitado" });
  };

  const handleToggleRankingVisibility = async () => {
    try {
      await toggleRankingVisibility();
      toast({ title: rankingVisible ? "Ranking oculto" : "Ranking visivel" });
    } catch {
      toast({ title: "Erro ao alterar visibilidade", variant: "destructive" });
    }
  };

  const handleUnitsRefresh = async () => {
    try {
      await fetchUnits();
      setActiveTab("unit-management");
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const tabItems = [
    { value: 'submissions', icon: Inbox, label: 'Envios', badge: pendingSubmissions.length, badgeColor: 'bg-red-500' },
    { value: 'attendances', icon: FileText, label: 'Forms', badge: pendingAttendances.length, badgeColor: 'bg-orange-500' },
    { value: 'news', icon: Newspaper, label: 'Noticias' },
    { value: 'tasks', icon: CheckSquare, label: 'Tarefas' },
    { value: 'scores', icon: BarChart2, label: 'Pontuacao' },
    { value: 'unit-management', icon: Users, label: 'Unidades' },
    { value: 'unit-info', icon: Info, label: 'Info' },
    { value: 'form-control', icon: Settings, label: 'Controle' },
    { value: 'statistics', icon: TrendingUp, label: 'Estatisticas' },
    { value: 'system', icon: Settings, label: 'Sistema' },
  ];

  return (
    <Layout>
      <div className="w-full px-2 sm:px-4 md:max-w-5xl md:mx-auto">
        <div className="mb-4 sm:mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">Menu Admin</h1>
                {(pendingSubmissions.length > 0 || pendingAttendances.length > 0) && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        <span className="text-white text-sm font-bold">{pendingSubmissions.length + pendingAttendances.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600">Gerencie tarefas, comunicacao e revise envios</p>
            </div>
            <Button onClick={() => setShowResetConfirm(true)} variant="destructive" size="sm" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Resetar
            </Button>
          </div>
        </div>

        {(pendingSubmissions.length > 0 || pendingAttendances.length > 0) && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Itens Pendentes para Analise</h3>
                  <div className="text-sm text-red-700">
                    {pendingSubmissions.length > 0 && <span className="inline-flex items-center mr-4"><Inbox className="w-4 h-4 mr-1" />{pendingSubmissions.length} tarefa{pendingSubmissions.length !== 1 ? 's' : ''}</span>}
                    {pendingAttendances.length > 0 && <span className="inline-flex items-center"><FileText className="w-4 h-4 mr-1" />{pendingAttendances.length} formulario{pendingAttendances.length !== 1 ? 's' : ''}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4 p-4 bg-white rounded-xl shadow-sm">
            {tabItems.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="relative flex flex-col items-center justify-center p-3 gap-2 h-auto min-h-[80px] bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gray-50 active:scale-95">
                <div className="relative">
                  <tab.icon className="w-6 h-6" />
                  {tab.badge && tab.badge > 0 && (
                    <span className={`absolute -top-2 -right-2 ${tab.badgeColor} text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-center">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="submissions" className="mt-6">
            <AdminSubmissionsTab submissions={pendingSubmissions} tasks={tasks} units={units} onValidate={handleValidateSubmission} />
          </TabsContent>

          <TabsContent value="attendances" className="mt-6">
            <AdminAttendancesTab attendances={pendingAttendances} units={units} onValidate={handleValidateAttendance} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <AdminTasksTab tasks={tasks} submissions={submissions} units={units} onCreateTask={handleCreateTask} onDeleteTask={confirmDeleteTask} />
          </TabsContent>

          <TabsContent value="scores" className="mt-6">
            <AdminScoresTab units={units} onUpdateScore={(id, score) => { updateUnitScore(id, score); toast({ title: "Pontuacao atualizada!" }); }} onUpdateLogo={(id, logo) => { updateUnitLogo(id, logo); toast({ title: "Logo atualizado!" }); }} />
          </TabsContent>

          <TabsContent value="unit-management" className="mt-6">
            <UnitManagement units={units} onUnitsUpdate={handleUnitsRefresh} />
          </TabsContent>

          <TabsContent value="unit-info" className="mt-6">
            <div className="space-y-6">
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-500" />Informacoes das Unidades</CardTitle></CardHeader></Card>
              {units.map(unit => (
                <Card key={unit.id}>
                  <CardHeader className="pb-4"><CardTitle className="flex items-center gap-3"><UnitDisplay name={unit.name} logo={unit.logo} size="md" /></CardTitle></CardHeader>
                  <CardContent><UnitInfoManager unitId={unit.id} /></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="form-control" className="mt-6">
            <AdminSettingsTab units={units} formSettings={formSettings} attendanceFormEnabled={attendanceFormEnabled} rankingVisible={rankingVisible} onToggleForm={handleToggleFormAvailability} onToggleRanking={handleToggleRankingVisibility} />
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <AdminStatsTab tasks={tasks} submissions={submissions} attendances={attendances} units={units} />
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <AdminNewsManager news={news} />
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <AdminSystemTab tasks={tasks} submissions={submissions} attendances={attendances} units={units} />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg text-red-600">Resetar Todas as Estatisticas</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              <div className="space-y-2">
                <p><strong>Esta acao ira DELETAR PERMANENTEMENTE:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-red-600">
                  <li>Todas as tarefas criadas</li>
                  <li>Todos os envios de tarefas</li>
                  <li>Todo o historico de presencas</li>
                  <li>Pontuacoes de todas as unidades</li>
                </ul>
                <p className="mt-3"><strong>As unidades permanecerao cadastradas.</strong></p>
                <p className="text-red-700 font-medium">Esta acao NAO PODE ser desfeita!</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowResetConfirm(false); setShowAdminPasswordPrompt(true); }} className="bg-destructive text-destructive-foreground">Confirmar Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminPasswordPrompt isOpen={showAdminPasswordPrompt} onClose={() => setShowAdminPasswordPrompt(false)} onConfirm={handleAdminPasswordConfirm} title="Confirmar Reset das Estatisticas" description="Digite sua senha de administrador para confirmar o reset." actionText="Resetar Estatisticas" isDestructive={true} />

      <AlertDialog open={!!taskToDelete} onOpenChange={() => taskToDelete && setTaskToDelete(null)}>
        <AlertDialogContent className="max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tarefa</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Tem certeza de que deseja remover esta tarefa? Submissoes aprovadas serao preservadas no historico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AdminDashboard;
