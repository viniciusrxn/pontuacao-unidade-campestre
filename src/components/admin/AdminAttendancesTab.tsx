import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Clock, Award, Shirt, Flag, User, Book, MessageSquare } from 'lucide-react';
import { WeeklyAttendance, Unit } from '@/types';

interface Props {
  attendances: WeeklyAttendance[];
  units: Unit[];
  onValidate: (attendance: WeeklyAttendance, approved: boolean, customScore?: number, feedback?: string) => void;
}

const AdminAttendancesTab: React.FC<Props> = ({ attendances, units, onValidate }) => {
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const getUnitName = (unitId: string) => units.find(u => u.id === unitId)?.name || 'Unidade desconhecida';

  const handleValidate = (attendance: WeeklyAttendance, approved: boolean) => {
    const finalScore = editingScores[attendance.id] !== undefined ? editingScores[attendance.id] : attendance.score;
    const feedback = feedbacks[attendance.id]?.trim() || undefined;
    onValidate(attendance, approved, finalScore, feedback);
    setEditingScores(prev => { const u = { ...prev }; delete u[attendance.id]; return u; });
    setFeedbacks(prev => { const u = { ...prev }; delete u[attendance.id]; return u; });
    setShowFeedback(prev => { const u = { ...prev }; delete u[attendance.id]; return u; });
  };

  const toggleFeedback = (id: string) => {
    setShowFeedback(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (attendances.length === 0) {
    return (
      <div className="text-center py-6 sm:py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Sem formularios pendentes para revisao.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attendances.map(attendance => (
        <Card key={attendance.id}>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex justify-between text-base sm:text-lg">
              <span className="truncate mr-2">Presenca: {getUnitName(attendance.unitId)}</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="truncate">Data: <strong>{new Date(attendance.date).toLocaleDateString()}</strong></span>
                <span className="whitespace-nowrap">Enviado: {new Date(attendance.submittedAt).toLocaleDateString()}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Detalhes de Presenca:</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2"><User className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" /><span>Membros presentes: {attendance.presentMembers.length}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" /><span>Membros pontuais: {attendance.punctualCount}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" /><span>Com lenco: {attendance.neckerchiefCount}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><Shirt className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" /><span>Uniformizados: {attendance.uniformCount}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><Flag className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" /><span>Bandeirim: {attendance.broughtFlag ? 'Sim' : 'Nao'}</span></div>
                    <div className="flex items-center gap-1 sm:gap-2"><Book className="w-3 h-3 sm:w-4 sm:h-4 text-blue-700" /><span>Biblia: {attendance.broughtBible ? 'Sim' : 'Nao'}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Membros Presentes:</h3>
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg max-h-32 sm:max-h-40 overflow-y-auto">
                    {attendance.presentMembers.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                        {attendance.presentMembers.map((member, idx) => <li key={idx}>{member}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500">Nenhum membro listado</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Pontuacao da Presenca</h4>
                  <span className="text-sm text-gray-600">
                    Atual: {editingScores[attendance.id] !== undefined ? editingScores[attendance.id] : attendance.score} pontos
                  </span>
                </div>
                {editingScores[attendance.id] !== undefined ? (
                  <div className="flex gap-2 items-center">
                    <Input type="number" min="0" className="w-20 text-sm" value={editingScores[attendance.id]}
                      onChange={(e) => setEditingScores(prev => ({ ...prev, [attendance.id]: parseInt(e.target.value) || 0 }))} />
                    <span className="text-sm text-gray-600">pontos</span>
                    <Button size="sm" variant="outline" onClick={() => { const u = { ...editingScores }; delete u[attendance.id]; setEditingScores(u); }} className="text-xs">Cancelar</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditingScores(prev => ({ ...prev, [attendance.id]: attendance.score || 0 }))} className="text-xs">Definir Pontuacao</Button>
                )}
              </div>

              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFeedback(attendance.id)}
                  className="text-xs text-gray-600 hover:text-gray-800 p-0 h-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  {showFeedback[attendance.id] ? 'Ocultar comentario' : 'Adicionar comentario'}
                </Button>
                {showFeedback[attendance.id] && (
                  <Textarea
                    className="mt-2 text-sm"
                    rows={2}
                    placeholder="Comentario para a unidade (opcional)..."
                    value={feedbacks[attendance.id] || ''}
                    onChange={(e) => setFeedbacks(prev => ({ ...prev, [attendance.id]: e.target.value }))}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <Button onClick={() => handleValidate(attendance, true)} className="bg-green-600 text-white text-xs sm:text-sm px-2 sm:px-3" size="sm">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Aprovar
              </Button>
              <Button onClick={() => handleValidate(attendance, false)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3" size="sm">
                <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminAttendancesTab;
