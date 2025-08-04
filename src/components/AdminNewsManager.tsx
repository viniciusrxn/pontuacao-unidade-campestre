
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Plus, Pin, Trash2 } from 'lucide-react';
import { NewsItem } from '@/types';
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

interface AdminNewsManagerProps {
  news: NewsItem[];
}

const AdminNewsManager: React.FC<AdminNewsManagerProps> = ({ news: initialNews }) => {
  const { createNewsItem, deleteNewsItem, fetchNews } = useCommunication();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);

  // Update local news when prop changes
  useEffect(() => {
    setNews(initialNews);
  }, [initialNews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newNewsItem = await createNewsItem(title.trim(), content.trim(), isPinned);
      
      // Update local state immediately
      if (newNewsItem) {
        const transformedNews: NewsItem = {
          id: newNewsItem.id,
          title: newNewsItem.title,
          content: newNewsItem.content,
          authorType: newNewsItem.author_type,
          createdAt: newNewsItem.created_at,
          updatedAt: newNewsItem.updated_at,
          isPinned: newNewsItem.is_pinned,
          status: newNewsItem.status as 'draft' | 'published' | 'archived'
        };
        
        setNews(prev => {
          const filtered = prev.filter(item => item.id !== transformedNews.id);
          return isPinned 
            ? [transformedNews, ...filtered]
            : [...filtered, transformedNews].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
        });
      }
      
      setTitle('');
      setContent('');
      setIsPinned(false);
      setIsCreating(false);
      
      toast({
        title: "Notícia publicada!",
        description: "A notícia foi publicada com sucesso e as unidades foram notificadas.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar a notícia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async () => {
    if (!newsToDelete) return;

    try {
      await deleteNewsItem(newsToDelete);
      
      // Update local state immediately
      setNews(prev => prev.filter(item => item.id !== newsToDelete));
      setNewsToDelete(null);
      
      toast({
        title: "Notícia excluída!",
        description: "A notícia foi removida com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a notícia. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Gerenciar Notícias
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Notícia
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="news-title">Título da Notícia</Label>
                <Input
                  id="news-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título da notícia"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="news-content">Conteúdo</Label>
                <Textarea
                  id="news-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva o conteúdo da notícia..."
                  rows={5}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pin-news"
                  checked={isPinned}
                  onCheckedChange={(checked) => setIsPinned(checked as boolean)}
                />
                <Label htmlFor="pin-news" className="flex items-center gap-1">
                  <Pin className="w-4 h-4" />
                  Fixar no topo
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Publicando..." : "Publicar Notícia"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setTitle('');
                    setContent('');
                    setIsPinned(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500">Clique em "Nova Notícia" para criar um comunicado.</p>
          )}
        </CardContent>
      </Card>

      {/* Lista de notícias existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Notícias Publicadas</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma notícia publicada ainda.</p>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      {item.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                      {item.title}
                    </h3>
                    <div className="flex gap-2">
                      {item.isPinned && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Fixado
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {item.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => setNewsToDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    Publicado em {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação para excluir notícia */}
      <AlertDialog open={!!newsToDelete} onOpenChange={() => setNewsToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Notícia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir esta notícia? Esta ação não pode ser desfeita.
              A notícia desaparecerá imediatamente do painel de todas as unidades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNews}
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

export default AdminNewsManager;
