import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, BarChart2, TrendingUp } from 'lucide-react';
import { Task, TaskSubmission, WeeklyAttendance, Unit } from '@/types';
import PWAStatus from '@/components/PWAStatus';

interface Props {
  tasks: Task[];
  submissions: TaskSubmission[];
  attendances: WeeklyAttendance[];
  units: Unit[];
}

const AdminSystemTab: React.FC<Props> = ({ tasks, submissions, attendances, units }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PWAStatus />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="w-5 h-5" />Informacoes do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Versao:</p><p className="font-medium">2.0.0 PWA</p></div>
              <div><p className="text-muted-foreground">Build:</p><p className="font-medium">{new Date().toLocaleDateString()}</p></div>
              <div><p className="text-muted-foreground">Usuarios:</p><p className="font-medium">{units.length} unidades</p></div>
              <div><p className="text-muted-foreground">Navegador:</p><p className="font-medium">{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Outro'}</p></div>
            </div>
            <div className="pt-3 border-t"><p className="text-xs text-muted-foreground">Sistema de Pontuacao da Unidade 85 - Progressive Web App</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5" />Status da Base de Dados</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{tasks.length}</p><p className="text-sm text-blue-800">Tarefas</p></div>
            <div className="text-center p-4 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{submissions.length}</p><p className="text-sm text-green-800">Envios</p></div>
            <div className="text-center p-4 bg-teal-50 rounded-lg"><p className="text-2xl font-bold text-teal-600">{attendances.length}</p><p className="text-sm text-teal-800">Presencas</p></div>
            <div className="text-center p-4 bg-orange-50 rounded-lg"><p className="text-2xl font-bold text-orange-600">{units.length}</p><p className="text-sm text-orange-800">Unidades</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Metricas de Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm">Tempo de Carregamento</span><Badge variant="outline">{Math.round(performance.now())}ms</Badge></div>
            <div className="flex justify-between items-center"><span className="text-sm">Memoria Usada</span><Badge variant="outline">{(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A'}</Badge></div>
            <div className="flex justify-between items-center"><span className="text-sm">Conexao</span><Badge variant={navigator.onLine ? "default" : "destructive"}>{navigator.onLine ? "Online" : "Offline"}</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemTab;
