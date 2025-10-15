import React, { useState, useEffect } from 'react';
import { Archive as ArchiveIcon, RefreshCw, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ArchivedListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  created_at: string;
  status: 'active' | 'archived' | 'deleted';
}

const Archive = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [archivedListings, setArchivedListings] = useState<ArchivedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Fetch archived and deleted listings
      const { data: listingsData } = await supabase
        .from('user_listings')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['archived', 'deleted'])
        .order('created_at', { ascending: false });
      
      if (listingsData) {
        setArchivedListings(listingsData);
      }
      
      setLoading(false);
    };

    fetchData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/auth');
          return;
        }
        setUser(session.user);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleRestore = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_listings')
        .update({ status: 'active' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArchivedListings(prev => prev.filter(listing => listing.id !== id));
      toast.success('Оголошення відновлено!');
    } catch (error) {
      console.error('Error restoring listing:', error);
      toast.error('Помилка при відновленні оголошення');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!user || !confirm('Ви впевнені? Це остаточно видалить оголошення.')) return;

    try {
      const { error } = await supabase
        .from('user_listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArchivedListings(prev => prev.filter(listing => listing.id !== id));
      toast.success('Оголошення остаточно видалено!');
    } catch (error) {
      console.error('Error permanently deleting listing:', error);
      toast.error('Помилка при видаленні оголошення');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'real-estate': 'Нерухомість',
      'transport': 'Транспорт',
      'electronics': 'Електроніка',
      'smartphones': 'Смартфони',
      'jewelry': 'Ювелірні вироби',
      'cosmetics': 'Косметика',
      'kids': 'Дитячі товари',
      'sports': 'Спорт',
      'tools': 'Інструменти',
      'tourism': 'Туризм',
      'gifts': 'Подарунки',
      'services': 'Послуги'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ArchiveIcon className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                Архів оголошень
              </h1>
            </div>
            <p className="text-slate-300 text-lg">
              Тут зберігаються ваші архівовані та видалені оголошення
            </p>
          </div>

          {/* Archived Listings */}
          {archivedListings.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">
                  Архів порожній
                </p>
                <p className="text-slate-400 mt-2">
                  Тут з'являться ваші архівовані та видалені оголошення
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedListings.map((listing) => (
                <Card key={listing.id} className="bg-slate-800/50 border-slate-700 hover:border-yellow-400 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge 
                        variant="outline" 
                        className={listing.status === 'archived' ? 'border-blue-400 text-blue-400' : 'border-red-400 text-red-400'}
                      >
                        {listing.status === 'archived' ? 'Архівовано' : 'Видалено'}
                      </Badge>
                      <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        {getCategoryLabel(listing.category)}
                      </Badge>
                    </div>
                    <CardTitle className="text-white line-clamp-2">{listing.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-slate-300">
                      {listing.description || 'Без опису'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {listing.image && (
                      <img 
                        src={listing.image} 
                        alt={listing.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-yellow-400">
                        {listing.price.toLocaleString()} ₴
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRestore(listing.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Відновити
                      </Button>
                      <Button
                        onClick={() => handlePermanentDelete(listing.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
