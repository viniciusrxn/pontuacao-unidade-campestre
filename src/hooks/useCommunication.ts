
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  NewsItem, 
  SupabaseNewsItem
} from '@/types';

export const useCommunication = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(true);

  // Transform functions
  const transformNewsItem = (item: SupabaseNewsItem): NewsItem => ({
    id: item.id,
    title: item.title,
    content: item.content,
    authorType: item.author_type,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isPinned: item.is_pinned,
    status: item.status as 'draft' | 'published' | 'archived'
  });



  // Fetch functions
  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews((data || []).map(transformNewsItem));
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };



  // Admin functions
  const createNewsItem = async (title: string, content: string, isPinned = false) => {
    try {
      console.log('Creating news item:', { title, content, isPinned });
      
      const { data, error } = await supabase
        .from('news')
        .insert({
          title: title.trim(),
          content: content.trim(),
          is_pinned: isPinned,
          status: 'published',
          author_type: 'admin'
        })
        .select()
        .single();

      console.log('News creation result:', { data, error });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      await fetchNews();
      return data;
    } catch (error) {
      console.error('Error creating news item - Full error:', error);
      throw error;
    }
  };

  const deleteNewsItem = async (newsId: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId);

      if (error) throw error;
      await fetchNews();
    } catch (error) {
      console.error('Error deleting news item:', error);
      throw error;
    }
  };







  



  // New unit management functions
  const updateUnitPassword = async (unitId: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.rpc('update_unit_password', {
        unit_id_param: unitId,
        new_password_param: newPassword
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating unit password:', error);
      throw error;
    }
  };

  const createNewUnit = async (name: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('create_new_unit', {
        name_param: name,
        password_param: password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating new unit:', error);
      throw error;
    }
  };

  const deleteUnit = async (unitId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_unit', {
        unit_id_param: unitId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting unit:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchNews();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    news,
    loading,
    // Admin functions
    createNewsItem,
    deleteNewsItem,

    // Unit management functions
    updateUnitPassword,
    createNewUnit,
    deleteUnit,
    // Refresh functions
    fetchNews,

  };
};
