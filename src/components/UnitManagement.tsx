
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCommunication } from '@/hooks/useCommunication';
import { Unit } from '@/types';
import UnitDisplay from './UnitDisplay';
import AdminPasswordPrompt from './AdminPasswordPrompt';
import { Key, Plus, Save, X, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppContext } from '@/contexts/AppContext';

interface UnitManagementProps {
  units: Unit[];
  onUnitsUpdate: () => void;
}

const UnitManagement: React.FC<UnitManagementProps> = ({ units, onUnitsUpdate }) => {
  const { updateUnitPassword, createNewUnit, deleteUnit } = useCommunication();
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Password editing state
  const [editingPasswords, setEditingPasswords] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // New unit form state
  const [newUnit, setNewUnit] = useState({
    name: '',
    password: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creatingUnit, setCreatingUnit] = useState(false);
  const [deletingUnits, setDeletingUnits] = useState<Record<string, boolean>>({});

  // Admin password confirmation states
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'create' | 'delete';
    data?: any;
  } | null>(null);

  // Password management functions
  const initPasswordEdit = (unitId: string) => {
    setEditingPasswords(prev => ({
      ...prev,
      [unitId]: ''
    }));
  };

  const handlePasswordChange = (unitId: string, password: string) => {
    setEditingPasswords(prev => ({
      ...prev,
      [unitId]: password
    }));
  };

  const togglePasswordVisibility = (unitId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const savePasswordChange = async (unitId: string) => {
    const newPassword = editingPasswords[unitId];
    if (!newPassword || newPassword.length < 3) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUnitPassword(unitId, newPassword);
      
      // Remove from editing state
      const newEditingPasswords = { ...editingPasswords };
      delete newEditingPasswords[unitId];
      setEditingPasswords(newEditingPasswords);
      
      // Hide password visibility
      setShowPasswords(prev => ({ ...prev, [unitId]: false }));
      
      toast({
        title: "Senha atualizada!",
        description: "A senha da unidade foi alterada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: "Ocorreu um erro ao alterar a senha. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const cancelPasswordEdit = (unitId: string) => {
    const newEditingPasswords = { ...editingPasswords };
    delete newEditingPasswords[unitId];
    setEditingPasswords(newEditingPasswords);
    
    // Hide password visibility
    setShowPasswords(prev => ({ ...prev, [unitId]: false }));
  };

  // Verify admin password - using Supabase RPC function
  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin', {
        username_param: 'admin',
        password_param: password
      });

      if (error) {
        console.error('Admin verification error:', error);
        return false;
      }

      const response = data as unknown as { success: boolean };
      return response.success;
    } catch (error) {
      console.error('Admin verification exception:', error);
      return false;
    }
  };

  // Handle admin password confirmation
  const handleAdminPasswordConfirm = async (password: string) => {
    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      toast({
        title: "Senha incorreta",
        description: "A senha do administrador está incorreta.",
        variant: "destructive",
      });
      return;
    }

    setShowAdminPasswordPrompt(false);

    if (pendingAction?.type === 'create') {
      await executeCreateUnit();
    } else if (pendingAction?.type === 'delete') {
      await executeDeleteUnit(pendingAction.data.unitId, pendingAction.data.unitName);
    }
    
    setPendingAction(null);
  };

  // Unit deletion function
  const requestDeleteUnit = (unitId: string, unitName: string) => {
    setPendingAction({ type: 'delete', data: { unitId, unitName } });
    setShowAdminPasswordPrompt(true);
  };

  const executeDeleteUnit = async (unitId: string, unitName: string) => {
    setDeletingUnits(prev => ({ ...prev, [unitId]: true }));
    
    try {
      await deleteUnit(unitId);
      
      toast({
        title: "Unidade excluída!",
        description: `A unidade "${unitName}" foi excluída com sucesso.`,
        variant: "default",
      });
      
      // Refresh units list
      onUnitsUpdate();
    } catch (error) {
      toast({
        title: "Erro ao excluir unidade",
        description: "Ocorreu um erro ao excluir a unidade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingUnits(prev => ({ ...prev, [unitId]: false }));
    }
  };

  // New unit creation functions
  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUnit.name || !newUnit.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e a senha da unidade.",
        variant: "destructive",
      });
      return;
    }

    if (newUnit.password.length < 3) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Check if unit name already exists
    if (units.some(unit => unit.name.toLowerCase() === newUnit.name.toLowerCase())) {
      toast({
        title: "Nome já existe",
        description: "Já existe uma unidade com este nome.",
        variant: "destructive",
      });
      return;
    }

    // Request admin password before creating
    setPendingAction({ type: 'create' });
    setShowAdminPasswordPrompt(true);
  };

  const executeCreateUnit = async () => {
    setCreatingUnit(true);
    try {
      await createNewUnit(newUnit.name, newUnit.password);
      
      // Reset form
      setNewUnit({ name: '', password: '' });
      setShowNewPassword(false);
      
      // Refresh units list
      onUnitsUpdate();
      
      toast({
        title: "Unidade criada!",
        description: "A nova unidade foi criada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar unidade",
        description: "Ocorreu um erro ao criar a unidade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCreatingUnit(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Create New Unit */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Criar Nova Unidade
          </CardTitle>
          <CardDescription className="text-sm">
            Adicione uma nova unidade ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleCreateUnit} className="space-y-4">
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit-name" className="text-sm font-medium">Nome da Unidade</Label>
                <Input
                  id="unit-name"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  placeholder="Digite o nome da unidade"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-password" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input
                    id="unit-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newUnit.password}
                    onChange={(e) => setNewUnit({ ...newUnit, password: e.target.value })}
                    placeholder="Digite a senha"
                    className="h-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 w-10 px-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={creatingUnit} 
              className="w-full sm:w-auto h-10"
            >
              {creatingUnit ? 'Criando...' : 'Criar Unidade'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manage Existing Units */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Key className="w-4 h-4 sm:w-5 sm:h-5" />
            Gerenciar Unidades
          </CardTitle>
          <CardDescription className="text-sm">
            Altere senhas ou exclua unidades existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {units.map((unit) => (
              <div 
                key={unit.id} 
                className={`${
                  isMobile 
                    ? 'flex flex-col space-y-3 p-3 bg-gray-50 rounded-lg' 
                    : 'flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                }`}
              >
                {/* Unit Info */}
                <div className={`${isMobile ? 'flex items-center justify-between' : 'flex items-center space-x-4'}`}>
                  <div className="flex items-center space-x-3">
                    <UnitDisplay name={unit.name} logo={unit.logo} />
                    <div className="text-xs sm:text-sm text-gray-600">
                      {unit.score} pts
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-2'}`}>
                  {editingPasswords[unit.id] !== undefined ? (
                    <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-2'}`}>
                      <div className="relative">
                        <Input
                          type={showPasswords[unit.id] ? "text" : "password"}
                          value={editingPasswords[unit.id]}
                          onChange={(e) => handlePasswordChange(unit.id, e.target.value)}
                          placeholder="Nova senha"
                          className={`h-9 ${isMobile ? 'w-full pr-10' : 'w-32 pr-8'}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-9 w-8 px-0"
                          onClick={() => togglePasswordVisibility(unit.id)}
                        >
                          {showPasswords[unit.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                      <div className={`${isMobile ? 'flex space-x-2' : 'flex space-x-1'}`}>
                        <Button
                          size="sm"
                          onClick={() => savePasswordChange(unit.id)}
                          className={`bg-success text-white hover:bg-success/90 ${isMobile ? 'flex-1 h-9' : 'h-9'}`}
                        >
                          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                          {isMobile && <span className="ml-1">Salvar</span>}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelPasswordEdit(unit.id)}
                          className={`${isMobile ? 'flex-1 h-9' : 'h-9'}`}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          {isMobile && <span className="ml-1">Cancelar</span>}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-2'}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => initPasswordEdit(unit.id)}
                        className={`${isMobile ? 'w-full h-9' : 'h-9'} flex items-center gap-2`}
                      >
                        <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Alterar Senha</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className={`${isMobile ? 'w-full h-9' : 'h-9'} flex items-center gap-2`}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 sm:mx-0 max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base sm:text-lg">Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Tem certeza que deseja excluir a unidade "{unit.name}"? 
                              Esta ação não pode ser desfeita e todos os dados relacionados 
                              (presenças, votos, missões, etc.) serão permanentemente removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => requestDeleteUnit(unit.id, unit.name)}
                              disabled={deletingUnits[unit.id]}
                              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingUnits[unit.id] ? 'Excluindo...' : 'Excluir Unidade'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Password Prompt */}
      <AdminPasswordPrompt
        isOpen={showAdminPasswordPrompt}
        onClose={() => {
          setShowAdminPasswordPrompt(false);
          setPendingAction(null);
        }}
        onConfirm={handleAdminPasswordConfirm}
        title={
          pendingAction?.type === 'create' 
            ? "Confirmar Criação de Unidade" 
            : "Confirmar Exclusão de Unidade"
        }
        description={
          pendingAction?.type === 'create'
            ? "Digite sua senha de administrador para criar a nova unidade."
            : "Digite sua senha de administrador para confirmar a exclusão da unidade."
        }
        actionText={
          pendingAction?.type === 'create' 
            ? "Criar Unidade" 
            : "Excluir Unidade"
        }
        isDestructive={pendingAction?.type === 'delete'}
      />
    </div>
  );
};

export default UnitManagement;
