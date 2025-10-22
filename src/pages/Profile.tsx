import React, { useState, useEffect } from 'react';
import { User, Settings, Wallet, Gift, Trophy, Camera, Edit3, Save, X, CreditCard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  balance: number;
  display_name: string | null;
}

interface UserTicket {
  id: string;
  ticket_number: string;
  price_paid: number;
  lottery: {
    title: string;
    category: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      setDisplayName(session.user.user_metadata?.display_name || '');
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('balance, display_name')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || session.user.email || '');
      }
      
      // Fetch user tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          price_paid,
          lotteries:lottery_id (
            title,
            category
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (ticketsData) {
        setTickets(ticketsData.map(ticket => ({
          ...ticket,
          lottery: {
            title: ticket.lotteries?.title || 'Невідома лотерея',
            category: ticket.lotteries?.category || 'Невідома категорія'
          }
        })));
      }
      
      setLoading(false);
    };

    fetchUserData();

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

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (!error) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
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
        <div className="max-w-4xl mx-auto">
          
          {/* Profile Header */}
          <Card className="mb-8 bg-gradient-to-r from-slate-800/50 to-teal-800/30 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* Avatar Section */}
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-yellow-400 shadow-2xl">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-2xl font-bold">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 bg-yellow-500 hover:bg-yellow-600 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 mb-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="text-xl font-bold bg-slate-700 border-slate-600 text-white"
                          placeholder="Ваше ім'я"
                        />
                        <Button
                          onClick={handleSaveProfile}
                          size="icon"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          size="icon"
                          variant="outline"
                          className="border-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-white">
                          {displayName || 'Користувач'}
                        </h1>
                        <Button
                          onClick={() => setIsEditing(true)}
                          size="icon"
                          variant="ghost"
                          className="text-yellow-400 hover:bg-yellow-400/20"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <p className="text-slate-300 mb-4">{user.email}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                      Активний гравець
                    </Badge>
                    <Badge variant="outline" className="border-teal-400 text-teal-400">
                      Новачок
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400">{profile?.balance?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-slate-300">Баланс ₴</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{tickets.length}</div>
                    <div className="text-sm text-slate-300">Квитків</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">0</div>
                    <div className="text-sm text-slate-300">Виграші</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                Огляд
              </TabsTrigger>
              <TabsTrigger value="tickets" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                Квитки
              </TabsTrigger>
              <TabsTrigger value="wallet" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                Гаманець
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                Налаштування
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Останні виграші
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">iPhone 15 Pro</div>
                        <div className="text-sm text-slate-400">15.07.2024</div>
                      </div>
                      <div className="text-green-400 font-bold">₴45,000</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">Золоті сережки</div>
                        <div className="text-sm text-slate-400">02.07.2024</div>
                      </div>
                      <div className="text-green-400 font-bold">₴8,500</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-400" />
                      Активні лотереї
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-white font-medium mb-2">MacBook Pro M3</div>
                      <div className="text-sm text-slate-400 mb-2">Квитків: 3 з 100</div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-white font-medium mb-2">Квартира в центрі</div>
                      <div className="text-sm text-slate-400 mb-2">Квитків: 1 з 1000</div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Мої квитки</CardTitle>
                  <CardDescription className="text-slate-400">
                    Всі ваші придбані квитки та їх статус
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tickets.length > 0 ? (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-white font-semibold">{ticket.lottery.title}</h4>
                              <p className="text-slate-400 text-sm">Категорія: {ticket.lottery.category}</p>
                            </div>
                            <span className="text-green-400 font-bold">{ticket.price_paid} ₴</span>
                          </div>
                          <p className="text-slate-300 text-sm">Номер квитка: {ticket.ticket_number}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Квитків поки немає. Придбайте перший квиток!
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-400" />
                    Гаманець
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
                    <div className="text-lg mb-2">Поточний баланс</div>
                    <div className="text-4xl font-bold">{profile?.balance?.toFixed(2) || '0.00'} ₴</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Поповнити рахунок
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-white py-6">
                      <History className="w-5 h-5 mr-2" />
                      Історія операцій
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Налаштування
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-slate-700 border-slate-600 text-slate-400"
                    />
                  </div>
                  
                  <Separator className="bg-slate-600" />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Безпека</h3>
                    <Button variant="outline" className="border-slate-600 text-white">
                      Змінити пароль
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => supabase.auth.signOut()}
                      className="w-full"
                    >
                      Вийти з акаунта
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;