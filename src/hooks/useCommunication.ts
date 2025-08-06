
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  NewsItem, 
  Poll, 
  PollVote, 
  SupabaseNewsItem,
  SupabasePoll,
  SupabasePollVote
} from '@/types';

export const useCommunication = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
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

  const transformPoll = (poll: SupabasePoll): Poll => ({
    id: poll.id,
    title: poll.title,
    description: poll.description,
    options: Array.isArray(poll.options) ? poll.options : [],
    createdAt: poll.created_at,
    expiresAt: poll.expires_at,
    status: poll.status as 'active' | 'closed' | 'draft',
    allowMultipleVotes: poll.allow_multiple_votes
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

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .in('status', ['active', 'closed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls((data || []).map(transformPoll));
    } catch (error) {
      console.error('Error fetching polls:', error);
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

  const createPoll = async (
    title: string, 
    description: string, 
    options: string[], 
    expiresAt?: string,
    allowMultipleVotes = false
  ) => {
    try {
      const pollOptions = options.map((text, index) => ({
        id: (index + 1).toString(),
        text
      }));

      const { data, error } = await supabase
        .from('polls')
        .insert({
          title,
          description,
          options: pollOptions,
          expires_at: expiresAt,
          allow_multiple_votes: allowMultipleVotes,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      await fetchPolls();
      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  };

  const deletePoll = async (pollId: string) => {
    try {
      // Delete poll votes first (cascade should handle this, but being explicit)
      await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', pollId);

      // Delete the poll
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;
      await fetchPolls();
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  };

  // Unit functions
  const votePoll = async (pollId: string, optionId: string, unitId: string) => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          unit_id: unitId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error voting in poll:', error);
      throw error;
    }
  };

  const getPollResults = async (pollId: string) => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', pollId);

      if (error) throw error;

      // Count votes by option
      const results: Record<string, number> = {};
      (data || []).forEach(vote => {
        results[vote.option_id] = (results[vote.option_id] || 0) + 1;
      });

      return results;
    } catch (error) {
      console.error('Error getting poll results:', error);
      return {};
    }
  };

  const getUnitVote = async (pollId: string, unitId: string) => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('unit_id', unitId);

      if (error) throw error;
      return data ? data.map(vote => vote.option_id) : [];
    } catch (error) {
      console.error('Error getting unit vote:', error);
      return [];
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
      await Promise.all([
        fetchNews(),
        fetchPolls()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    news,
    polls,
    loading,
    // Admin functions
    createNewsItem,
    deleteNewsItem,
    createPoll,
    deletePoll,
    // Unit functions
    votePoll,
    getPollResults,
    getUnitVote,
    // Unit management functions
    updateUnitPassword,
    createNewUnit,
    deleteUnit,
    // Refresh functions
    fetchNews,
    fetchPolls
  };
};
