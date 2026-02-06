import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, MessageSquare } from 'lucide-react';
import { TaskSubmission, Task, Unit } from '@/types';

interface Props {
  submissions: TaskSubmission[];
  tasks: Task[];
  units: Unit[];
  onValidate: (submission: TaskSubmission, approved: boolean, feedback?: string) => void;
}

const AdminSubmissionsTab: React.FC<Props> = ({ submissions, tasks, units, onValidate }) => {
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const getTaskName = (taskId: string) => tasks.find(t => t.id === taskId)?.title || 'Tarefa desconhecida';
  const getTaskPoints = (taskId: string) => tasks.find(t => t.id === taskId)?.points || 0;
  const getUnitName = (unitId: string) => units.find(u => u.id === unitId)?.name || 'Unidade desconhecida';

  const handleValidate = (submission: TaskSubmission, approved: boolean) => {
    const feedback = feedbacks[submission.id]?.trim() || undefined;
    onValidate(submission, approved, feedback);
    setFeedbacks(prev => { const u = { ...prev }; delete u[submission.id]; return u; });
    setShowFeedback(prev => { const u = { ...prev }; delete u[submission.id]; return u; });
  };

  const toggleFeedback = (id: string) => {
    setShowFeedback(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-6 sm:py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Nao ha envios pendentes para analise.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map(submission => (
        <Card key={submission.id}>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex justify-between text-base sm:text-lg">
              <span className="truncate mr-2">{getTaskName(submission.taskId)}</span>
              <span className="text-green-600 whitespace-nowrap">{getTaskPoints(submission.taskId)} pts</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="truncate">Enviado por: <strong>{getUnitName(submission.unitId)}</strong></span>
                <span className="whitespace-nowrap">{new Date(submission.submittedAt).toLocaleDateString()}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="mb-4">
              <h3 className="font-medium mb-2 text-sm sm:text-base">Prova de envio:</h3>
              <div className="p-2 sm:p-4 bg-gray-50 rounded-lg text-xs sm:text-sm">{submission.proof}</div>
            </div>

            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFeedback(submission.id)}
                className="text-xs text-gray-600 hover:text-gray-800 p-0 h-auto"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                {showFeedback[submission.id] ? 'Ocultar comentario' : 'Adicionar comentario'}
              </Button>
              {showFeedback[submission.id] && (
                <Textarea
                  className="mt-2 text-sm"
                  rows={2}
                  placeholder="Comentario para a unidade (opcional)..."
                  value={feedbacks[submission.id] || ''}
                  onChange={(e) => setFeedbacks(prev => ({ ...prev, [submission.id]: e.target.value }))}
                />
              )}
            </div>

            <div className="flex gap-2 sm:gap-3 justify-end">
              <Button onClick={() => handleValidate(submission, true)} className="bg-green-600 text-white text-xs sm:text-sm px-2 sm:px-3" size="sm">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Aprovar
              </Button>
              <Button onClick={() => handleValidate(submission, false)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3" size="sm">
                <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminSubmissionsTab;
