
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Vote, Clock } from 'lucide-react';
import { Poll } from '@/types';
import { useCommunication } from '@/hooks/useCommunication';
import { useToast } from '@/components/ui/use-toast';

interface PollsComponentProps {
  polls: Poll[];
  unitId?: string;
  isAdmin?: boolean;
}

const PollsComponent: React.FC<PollsComponentProps> = ({ 
  polls, 
  unitId, 
  isAdmin = false 
}) => {
  const { votePoll, getPollResults, getUnitVote } = useCommunication();
  const { toast } = useToast();
  const [pollResults, setPollResults] = useState<Record<string, Record<string, number>>>({});
  const [userVotes, setUserVotes] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPollData = async () => {
      for (const poll of polls) {
        // Load results for all polls
        const results = await getPollResults(poll.id);
        setPollResults(prev => ({ ...prev, [poll.id]: results }));

        // Load user votes if unitId is provided
        if (unitId) {
          const votes = await getUnitVote(poll.id, unitId);
          setUserVotes(prev => ({ ...prev, [poll.id]: votes }));
        }
      }
    };

    loadPollData();
  }, [polls, unitId]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!unitId) return;

    setLoading(prev => ({ ...prev, [pollId]: true }));

    try {
      await votePoll(pollId, optionId, unitId);
      
      // Refresh poll data
      const results = await getPollResults(pollId);
      setPollResults(prev => ({ ...prev, [pollId]: results }));
      
      const votes = await getUnitVote(pollId, unitId);
      setUserVotes(prev => ({ ...prev, [pollId]: votes }));

      toast({
        title: "Voto registrado!",
        description: "Seu voto foi registrado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [pollId]: false }));
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

  const canUserVote = (poll: Poll) => {
    if (!unitId || isPollExpired(poll) || poll.status !== 'active') return false;
    
    const userPollVotes = userVotes[poll.id] || [];
    if (!poll.allowMultipleVotes && userPollVotes.length > 0) return false;
    
    return true;
  };

  if (polls.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhuma enquete ativa no momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {polls.map((poll) => {
        const totalVotes = getTotalVotes(poll.id);
        const userPollVotes = userVotes[poll.id] || [];
        const isExpired = isPollExpired(poll);
        const canVote = canUserVote(poll);

        return (
          <div key={poll.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{poll.title}</h3>
                {poll.description && (
                  <p className="text-gray-600 text-sm mt-1">{poll.description}</p>
                )}
              </div>
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
            </div>

            <div className="space-y-3">
              {poll.options.map((option) => {
                const percentage = getVotePercentage(poll.id, option.id);
                const votes = pollResults[poll.id]?.[option.id] || 0;
                const hasVoted = userPollVotes.includes(option.id);

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {hasVoted && <Vote className="w-4 h-4 text-green-600" />}
                        {option.text}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {votes} voto{votes !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                        </span>
                        {canVote && !hasVoted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(poll.id, option.id)}
                            disabled={loading[poll.id]}
                            className="text-xs"
                          >
                            Votar
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Total de votos: {totalVotes}</span>
                <span>
                  Criada em {new Date(poll.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {poll.allowMultipleVotes && (
                <p className="mt-1 text-blue-600">
                  * Múltiplos votos permitidos
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PollsComponent;
