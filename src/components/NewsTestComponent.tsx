import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const NewsTestComponent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testCreateNews = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentando criar notícia:', { title, content });
      
      const { data, error } = await supabase
        .from('news')
        .insert({
          title: title.trim(),
          content: content.trim(),
          is_pinned: false,
          status: 'published',
          author_type: 'admin'
        })
        .select()
        .single();

      console.log('Resultado:', { data, error });

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      toast({
        title: "✅ Notícia criada!",
        description: `Notícia "${title}" foi criada com sucesso.`,
        variant: "default",
      });

      // Limpar campos
      setTitle('');
      setContent('');

    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: "❌ Erro ao criar notícia",
        description: `Erro: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de Criação de Notícias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da notícia..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo da notícia..."
              rows={4}
            />
          </div>
          
          <Button 
            onClick={testCreateNews}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Criando...' : 'Criar Notícia de Teste'}
          </Button>
          
          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Tabela utilizada:</strong> news</p>
            <p><strong>Campos:</strong> title, content, is_pinned, status, author_type</p>
            <p>Abra o console do navegador para ver logs detalhados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsTestComponent;