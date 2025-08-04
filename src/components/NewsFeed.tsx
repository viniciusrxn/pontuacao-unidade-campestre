
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Pin } from 'lucide-react';
import { NewsItem } from '@/types';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  if (news.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhuma notícia publicada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <div
          key={item.id}
          className={`p-4 rounded-lg border ${
            item.isPinned 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {item.isPinned && (
                <Pin className="w-4 h-4 text-yellow-600" />
              )}
              {item.title}
            </h3>
            {item.isPinned && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Fixado
              </Badge>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none mb-3">
            <p className="text-gray-700 leading-relaxed">
              {item.content}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Publicado em {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="capitalize">{item.authorType}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsFeed;
