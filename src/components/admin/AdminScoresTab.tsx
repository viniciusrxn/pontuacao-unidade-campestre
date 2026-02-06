import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Image } from 'lucide-react';
import { Unit } from '@/types';
import UnitDisplay from '@/components/UnitDisplay';

interface Props {
  units: Unit[];
  onUpdateScore: (unitId: string, newScore: number) => void;
  onUpdateLogo: (unitId: string, newLogo: string) => void;
}

const AdminScoresTab: React.FC<Props> = ({ units, onUpdateScore, onUpdateLogo }) => {
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});
  const [editingLogos, setEditingLogos] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Gestao de Pontuacao</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Visualize e atualize pontuacoes da unidade</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Unidade</TableHead>
                <TableHead className="text-xs">Pontos</TableHead>
                <TableHead className="text-xs">Editar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map(unit => (
                <TableRow key={unit.id}>
                  <TableCell className="py-2"><UnitDisplay name={unit.name} logo={unit.logo} className="text-xs" /></TableCell>
                  <TableCell className="py-2">
                    {editingScores[unit.id] !== undefined ? (
                      <Input type="number" className="w-16 sm:w-24 text-xs" value={editingScores[unit.id]} onChange={e => setEditingScores(prev => ({ ...prev, [unit.id]: parseInt(e.target.value) || 0 }))} />
                    ) : (
                      <div className="flex items-center"><Award className="w-3 h-3 mr-1 text-yellow-500" /><span className="text-xs">{unit.score}</span></div>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {editingScores[unit.id] !== undefined ? (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button size="sm" onClick={() => { onUpdateScore(unit.id, editingScores[unit.id]); const u = { ...editingScores }; delete u[unit.id]; setEditingScores(u); }} className="bg-green-600 text-white h-7 text-xs px-2">Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => { const u = { ...editingScores }; delete u[unit.id]; setEditingScores(u); }} className="text-xs">Cancelar</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditingScores(prev => ({ ...prev, [unit.id]: unit.score }))} className="h-7 text-xs px-2">Editar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Gerenciamento de Logos</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Atualize o logo da unidade com URLs</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {units.map(unit => (
              <div key={unit.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0"><UnitDisplay name={unit.name} logo={editingLogos[unit.id] || unit.logo} size="md" /></div>
                  <div className="flex-grow space-y-2 sm:space-y-3">
                    {editingLogos[unit.id] !== undefined ? (
                      <>
                        <Label htmlFor={`logo-${unit.id}`} className="text-xs sm:text-sm">Logo URL:</Label>
                        <Input id={`logo-${unit.id}`} value={editingLogos[unit.id]} onChange={e => setEditingLogos(prev => ({ ...prev, [unit.id]: e.target.value }))} placeholder="URL da imagem do logo" className="w-full text-xs sm:text-sm" />
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => { onUpdateLogo(unit.id, editingLogos[unit.id]); const u = { ...editingLogos }; delete u[unit.id]; setEditingLogos(u); }} size="sm" className="bg-green-600 text-white h-7 text-xs px-2">Salvar</Button>
                          <Button size="sm" variant="outline" onClick={() => { const u = { ...editingLogos }; delete u[unit.id]; setEditingLogos(u); }} className="h-7 text-xs px-2">Cancelar</Button>
                        </div>
                      </>
                    ) : (
                      <Button onClick={() => setEditingLogos(prev => ({ ...prev, [unit.id]: unit.logo || '' }))} variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 h-7 text-xs px-2">
                        <Image className="w-3 h-3 sm:w-4 sm:h-4" />Alterar logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminScoresTab;
