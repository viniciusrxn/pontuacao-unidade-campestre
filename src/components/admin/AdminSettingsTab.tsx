import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Lock, Unlock, Settings, BarChart3 } from 'lucide-react';
import { Unit, FormSettings } from '@/types';
import UnitDisplay from '@/components/UnitDisplay';

interface Props {
  units: Unit[];
  formSettings: FormSettings | null;
  attendanceFormEnabled: boolean;
  rankingVisible: boolean;
  onToggleForm: () => void;
  onToggleRanking: () => void;
}

const AdminSettingsTab: React.FC<Props> = ({ units, formSettings, attendanceFormEnabled, rankingVisible, onToggleForm, onToggleRanking }) => {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, boolean>>({});
  const [formControlMode, setFormControlMode] = useState<'all' | 'selected'>('all');

  useEffect(() => {
    if (formSettings) {
      const newSelected: Record<string, boolean> = {};
      if (formSettings.enabledUnits && formSettings.enabledUnits.length > 0) {
        setFormControlMode('selected');
        formSettings.enabledUnits.forEach(id => { newSelected[id] = true; });
      } else if (formSettings.isEnabled) {
        setFormControlMode('all');
      }
      setSelectedUnits(newSelected);
    }
  }, [formSettings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Controle de Formularios</span>
          <Button onClick={onToggleForm} size="sm" variant={attendanceFormEnabled ? "destructive" : "default"} className="flex gap-2 items-center">
            {attendanceFormEnabled ? <><Lock className="h-4 w-4" /> Desabilitar</> : <><Unlock className="h-4 w-4" /> Habilitar</>}
          </Button>
        </CardTitle>
        <CardDescription>Gerencie a disponibilidade do formulario de presenca semanal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-medium">Formulario de Presenca Semanal</h3>
                <p className="text-sm text-gray-600">
                  Status: {attendanceFormEnabled ? <span className="text-green-600 font-medium">Habilitado</span> : <span className="text-red-600 font-medium">Desabilitado</span>}
                </p>
              </div>
            </div>
            <Switch checked={attendanceFormEnabled} onCheckedChange={onToggleForm} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-medium">Visibilidade do Ranking Geral</h3>
                <p className="text-sm text-gray-600">
                  Status: {rankingVisible ? <span className="text-green-600 font-medium">Visivel</span> : <span className="text-red-600 font-medium">Oculto</span>}
                </p>
              </div>
            </div>
            <Switch checked={rankingVisible} onCheckedChange={onToggleRanking} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Configuracoes de Acesso</h3>
            <div className="flex gap-2 items-center text-sm">
              <button onClick={() => setFormControlMode('all')} className={`px-2 py-1 rounded ${formControlMode === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Todas</button>
              <button onClick={() => setFormControlMode('selected')} className={`px-2 py-1 rounded ${formControlMode === 'selected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Especificas</button>
            </div>
          </div>
          {formControlMode === 'selected' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="mb-3 font-medium">Selecione as unidades:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {units.map(unit => (
                  <div key={unit.id} className={`flex items-center justify-between p-2 rounded border ${selectedUnits[unit.id] ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}>
                    <UnitDisplay name={unit.name} logo={unit.logo} size="sm" />
                    <Checkbox checked={selectedUnits[unit.id] || false} onCheckedChange={() => setSelectedUnits(prev => ({ ...prev, [unit.id]: !prev[unit.id] }))} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 pt-4 border-t">
            <Button onClick={onToggleForm} variant={attendanceFormEnabled ? "destructive" : "default"} className="w-full">
              {attendanceFormEnabled ? 'Desabilitar Acesso ao Formulario' : 'Habilitar Acesso ao Formulario'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSettingsTab;
