import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Users, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { Task, TaskSubmission, WeeklyAttendance, Unit } from '@/types';

interface Props {
  tasks: Task[];
  submissions: TaskSubmission[];
  attendances: WeeklyAttendance[];
  units: Unit[];
}

const AdminStatsTab: React.FC<Props> = ({ tasks, submissions, attendances, units }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Enviadas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {submissions.filter(s => s.status === 'completed').length} aprovadas, {submissions.filter(s => s.status === 'pending').length} pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presenca Media</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendances.length > 0 ? Math.round(attendances.reduce((sum, att) => sum + att.presentMembers.length, 0) / attendances.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">membros por semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Ativas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">de {tasks.length} total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Unidades Mais Ativas</CardTitle>
          <CardDescription>Ranking baseado em tarefas enviadas e presencas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {units.map(unit => {
              const uSubs = submissions.filter(s => s.unitId === unit.id);
              const uAtts = attendances.filter(a => a.unitId === unit.id);
              return { ...unit, activityScore: uSubs.length + (uAtts.length * 2), subs: uSubs.length, atts: uAtts.length };
            }).sort((a, b) => b.activityScore - a.activityScore).slice(0, 5).map((unit, index) => (
              <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{index + 1}</div>
                  <div>
                    <p className="font-medium">{unit.name}</p>
                    <p className="text-xs text-gray-600">{unit.subs} tarefas / {unit.atts} presencas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{unit.score}</p>
                  <p className="text-xs text-gray-600">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Estatisticas de Presenca Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {units.map(unit => {
              const uAtts = attendances.filter(a => a.unitId === unit.id && a.status === 'validated');
              const avg = uAtts.length > 0 ? Math.round(uAtts.reduce((sum, att) => sum + att.presentMembers.length, 0) / uAtts.length) : 0;
              return (
                <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{unit.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{uAtts.length} semanas</span>
                      <span>{avg} media</span>
                      <span>{unit.score} pontos</span>
                    </div>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (avg / 15) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsTab;
