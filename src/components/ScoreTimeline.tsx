import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

interface ScoreEntry {
  date: string;
  score: number;
  label: string;
}

interface Props {
  unitId: string;
  unitName: string;
}

const ScoreTimeline: React.FC<Props> = ({ unitId, unitName }) => {
  const [data, setData] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data: history, error } = await supabase
          .from('score_history')
          .select('*')
          .eq('unit_id', unitId)
          .order('changed_at', { ascending: true });

        if (error) throw error;

        if (history && history.length > 0) {
          const entries: ScoreEntry[] = history.map((h: any) => ({
            date: new Date(h.changed_at).toISOString(),
            score: h.new_score,
            label: new Date(h.changed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          }));
          setData(entries);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [unitId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Historico de Pontuacao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Dados insuficientes para exibir o grafico. Continue completando tarefas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Evolucao de Pontuacao - {unitName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#888' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#888' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(value: number) => [`${value} pts`, 'Pontuacao']}
                labelFormatter={(label: string) => `Data: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2563eb' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreTimeline;
