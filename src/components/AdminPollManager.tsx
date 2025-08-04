import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, X, Clock, Trash2 } from 'lucide-react';
import { Poll, PollOption } from '@/types';
import { useCommunication } from '@/hooks/useCommunication';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminPollManagerProps {
  polls: Poll[];
}

const AdminPollManager: React.FC<AdminPollManagerProps> = ({ polls: initialPolls }) => {
  const { createPoll, deletePoll, getPollResults } = useCommunication();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pollResults, setPollResults] = useState<Record<string, Record<string, number>>>({});
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);

  // Update local polls when prop changes
  useEffect(() => {
    setPolls(initialPolls);
  }, [initialPolls]);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const loadPollResults = async (pollId: string) => {
    const results = await getPollResults(pollId);
    setPollResults(prev => ({ ...prev, [pollId]: results }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, preencha o título da enquete.",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast({
        title: "Opções insuficientes",
        description: "A enquete deve ter pelo menos 2 opções válidas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newPoll = await createPoll(
        title.trim(),
        description.trim(),
        validOptions,
        expiresAt || undefined,
        allowMultipleVotes
      );
      
      // Update local state immediately
      if (newPoll) {
        // Properly transform the poll options from Supabase Json to PollOption[]
        const transformedOptions: PollOption[] = Array.isArray(newPoll.options) 
          ? newPoll.options.map((option: any) => ({
              id: option.id || '',
              text: option.text || ''
            }))
          : [];

        const transformedPoll: Poll = {
          id: newPoll.id,
          title: newPoll.title,
          description: newPoll.description,
          options: transformedOptions,
          createdAt: newPoll.created_at,
          expiresAt: newPoll.expires_at,
          status: newPoll.status as 'active' | 'closed' | 'draft',
          allowMultipleVotes: newPoll.allow_multiple_votes
        };
        
        setPolls(prev => [transformedPoll, ...prev]);
      }
      
      setTitle('');
      setDescription('');
      setOptions(['', '']);
      setExpiresAt('');
      setAllowMultipleVotes(false);
      setIsCreating(false);
      
      toast({
        title: "Enquete criada!",
        description: "A enquete foi criada com sucesso e as unidades foram notificadas.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar enquete",
        description: "Não foi possível criar a enquete. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async () => {
    if (!pollToDelete) return;

    try {
      await deletePoll(pollToDelete);
      
      // Update local state immediately
      setPolls(prev => prev.filter(poll => poll.id !== pollToDelete));
      setPollToDelete(null);
      
      toast({
        title: "Enquete excluída!",
        description: "A enquete foi removida com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a enquete. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getTotalVotes = (pollId: string) => {
    const results = pollResults[pollId] || {};
    return Object.values(results).reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (pollId: string, optionId: string) => {
    const results = pollResults[pollId] || {};
    const total = getTotalVotes(pollId);
    const optionVotes = results[optionId] || 0;
    return total > 0 ? (optionVotes / total) * 100 : 0;
  };

  const isPollExpired = (poll: Poll) => {
    if (!poll.expiresAt) return false;
    return new Date(poll.expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Gerenciar Enquetes
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Enquete
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="poll-title">Título da Enquete</Label>
                <Input
                  id="poll-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título da enquete"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="poll-description">Descrição (opcional)</Label>
                <Textarea
                  id="poll-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione uma descrição para a enquete..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Opções da Enquete</Label>
                <div className="space-y-2 mt-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Opção
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="poll-expires">Data de Expiração (opcional)</Label>
                <Input
                  id="poll-expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiple-votes"
                  checked={allowMultipleVotes}
                  onCheckedChange={(checked) => setAllowMultipleVotes(checked as boolean)}
                />
                <Label htmlFor="multiple-votes">
                  Permitir múltiplos votos por unidade
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Criando..." : "Criar Enquete"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setTitle('');
                    setDescription('');
                    setOptions(['', '']);
                    setExpiresAt('');
                    setAllowMultipleVotes(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500">Clique em "Nova Enquete" para criar uma votação.</p>
          )}
        </CardContent>
      </Card>

      {/* Lista de enquetes existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Enquetes Criadas</CardTitle>
        </CardHeader>
        <CardContent>
          {polls.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma enquete criada ainda.</p>
          ) : (
            <div className="space-y-6">
              {polls.map((poll) => {
                const totalVotes = getTotalVotes(poll.id);
                const isExpired = isPollExpired(poll);

                return (
                  <div key={poll.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{poll.title}</h3>
                        {poll.description && (
                          <p className="text-gray-600 text-sm mt-1">{poll.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end gap-1">
                          <Badge 
                            variant={poll.status === 'active' && !isExpired ? "default" : "secondary"}
                          >
                            {isExpired ? 'Expirada' : poll.status === 'active' ? 'Ativa' : 'Fechada'}
                          </Badge>
                          {poll.expiresAt && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(poll.expiresAt).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => setPollToDelete(poll.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {poll.options.map((option) => {
                        const percentage = getVotePercentage(poll.id, option.id);
                        const votes = pollResults[poll.id]?.[option.id] || 0;

                        return (
                          <div key={option.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">{option.text}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {votes} voto{votes !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-2">
                      <span>Total de votos: {totalVotes}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadPollResults(poll.id)}
                      >
                        Atualizar Resultados
                      </Button>
                    </div>

                    {poll.allowMultipleVotes && (
                      <p className="text-xs text-blue-600 mt-1">
                        * Múltiplos votos permitidos
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação para excluir enquete */}
      <AlertDialog open={!!pollToDelete} onOpenChange={() => setPollToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Enquete</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir esta enquete? Esta ação não pode ser desfeita.
              A enquete e todos os votos associados desaparecerão imediatamente do painel de todas as unidades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePoll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPollManager;
