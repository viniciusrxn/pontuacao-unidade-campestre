
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Users, Crown, Megaphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Counselor {
  id: string;
  name: string;
}

interface Pathfinder {
  id: string;
  name: string;
  role: string;
}

interface UnitInfo {
  id?: string;
  unitId: string;
  counselors: Counselor[];
  pathfinders: Pathfinder[];
  unitMotto: string;
}

interface UnitInfoManagerProps {
  unitId: string;
}

const UnitInfoManager: React.FC<UnitInfoManagerProps> = ({ unitId }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [unitInfo, setUnitInfo] = useState<UnitInfo>({
    unitId,
    counselors: [],
    pathfinders: [],
    unitMotto: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUnitInfo();
  }, [unitId]);

  const loadUnitInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('unit_info')
        .select('*')
        .eq('unit_id', unitId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Safely parse counselors from JSON
        let counselors: Counselor[] = [];
        if (Array.isArray(data.counselors)) {
          counselors = (data.counselors as unknown as Counselor[]).filter(
            (c): c is Counselor => c && typeof c === 'object' && 'id' in c && 'name' in c
          );
        }

        // Safely parse pathfinders from JSON
        let pathfinders: Pathfinder[] = [];
        if (Array.isArray(data.pathfinders)) {
          pathfinders = (data.pathfinders as unknown as Pathfinder[]).filter(
            (p): p is Pathfinder => p && typeof p === 'object' && 'id' in p && 'name' in p && 'role' in p
          );
        }

        setUnitInfo({
          id: data.id,
          unitId: data.unit_id,
          counselors,
          pathfinders,
          unitMotto: data.unit_motto || ''
        });
      }
    } catch (error) {
      console.error('Error loading unit info:', error);
      toast({
        title: "Erro ao carregar informações",
        description: "Não foi possível carregar as informações da unidade.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveUnitInfo = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        unit_id: unitId,
        counselors: unitInfo.counselors as any,
        pathfinders: unitInfo.pathfinders as any,
        unit_motto: unitInfo.unitMotto,
        updated_at: new Date().toISOString()
      };

      if (unitInfo.id) {
        const { error } = await supabase
          .from('unit_info')
          .update(dataToSave)
          .eq('id', unitInfo.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('unit_info')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        setUnitInfo(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Informações salvas!",
        description: "As informações da unidade foram atualizadas com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving unit info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações da unidade.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addCounselor = () => {
    const newCounselor: Counselor = {
      id: Date.now().toString(),
      name: ''
    };
    setUnitInfo(prev => ({
      ...prev,
      counselors: [...prev.counselors, newCounselor]
    }));
  };

  const removeCounselor = (id: string) => {
    setUnitInfo(prev => ({
      ...prev,
      counselors: prev.counselors.filter(c => c.id !== id)
    }));
  };

  const updateCounselor = (id: string, name: string) => {
    setUnitInfo(prev => ({
      ...prev,
      counselors: prev.counselors.map(c => 
        c.id === id ? { ...c, name } : c
      )
    }));
  };

  const addPathfinder = () => {
    const newPathfinder: Pathfinder = {
      id: Date.now().toString(),
      name: '',
      role: ''
    };
    setUnitInfo(prev => ({
      ...prev,
      pathfinders: [...prev.pathfinders, newPathfinder]
    }));
  };

  const removePathfinder = (id: string) => {
    setUnitInfo(prev => ({
      ...prev,
      pathfinders: prev.pathfinders.filter(p => p.id !== id)
    }));
  };

  const updatePathfinder = (id: string, field: 'name' | 'role', value: string) => {
    setUnitInfo(prev => ({
      ...prev,
      pathfinders: prev.pathfinders.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-2 sm:px-0">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando informações...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Conselheiros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Conselheiros
          </CardTitle>
          <CardDescription className="text-sm">
            Adicione os nomes dos conselheiros da unidade
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {unitInfo.counselors.map((counselor) => (
              <div key={counselor.id} className={`${isMobile ? 'space-y-2' : 'flex items-center gap-2'}`}>
                <Input
                  value={counselor.name}
                  onChange={(e) => updateCounselor(counselor.id, e.target.value)}
                  placeholder="Nome do conselheiro"
                  className={`${isMobile ? 'w-full' : 'flex-1'} h-10`}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeCounselor(counselor.id)}
                  className={`${isMobile ? 'w-full' : 'w-auto'} h-10`}
                >
                  <Trash2 className="w-4 h-4" />
                  {isMobile && <span className="ml-1">Remover</span>}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addCounselor}
              className="w-full h-10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Conselheiro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Desbravadores */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Desbravadores
          </CardTitle>
          <CardDescription className="text-sm">
            Adicione os nomes e funções dos desbravadores da unidade
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {unitInfo.pathfinders.map((pathfinder) => (
              <div key={pathfinder.id} className={`${isMobile ? 'space-y-2' : 'flex items-center gap-2'}`}>
                <div className={`${isMobile ? 'space-y-2' : 'flex gap-2 flex-1'}`}>
                  <Input
                    value={pathfinder.name}
                    onChange={(e) => updatePathfinder(pathfinder.id, 'name', e.target.value)}
                    placeholder="Nome do desbravador"
                    className={`${isMobile ? 'w-full' : 'flex-1'} h-10`}
                  />
                  <Input
                    value={pathfinder.role}
                    onChange={(e) => updatePathfinder(pathfinder.id, 'role', e.target.value)}
                    placeholder="Função (ex: Secretário, Capitão...)"
                    className={`${isMobile ? 'w-full' : 'flex-1'} h-10`}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removePathfinder(pathfinder.id)}
                  className={`${isMobile ? 'w-full' : 'w-auto'} h-10`}
                >
                  <Trash2 className="w-4 h-4" />
                  {isMobile && <span className="ml-1">Remover</span>}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPathfinder}
              className="w-full h-10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Desbravador
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grito da Unidade */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            Grito da Unidade
          </CardTitle>
          <CardDescription className="text-sm">
            Defina o grito oficial da unidade
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit-motto" className="text-sm font-medium">
                Texto do Grito
              </Label>
              <Textarea
                id="unit-motto"
                value={unitInfo.unitMotto}
                onChange={(e) => setUnitInfo(prev => ({ ...prev, unitMotto: e.target.value }))}
                placeholder="Digite o grito da unidade..."
                className="min-h-[100px] resize-none"
                rows={4}
              />
            </div>
            {unitInfo.unitMotto && (
              <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                <div className="text-sm font-medium text-gray-700 mb-1">Preview:</div>
                <div className="text-gray-900 whitespace-pre-wrap">{unitInfo.unitMotto}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={saveUnitInfo}
          disabled={isSaving}
          className="w-full sm:w-auto bg-success text-white hover:bg-success/90"
        >
          {isSaving ? 'Salvando...' : 'Salvar Informações'}
        </Button>
      </div>
    </div>
  );
};

export default UnitInfoManager;
