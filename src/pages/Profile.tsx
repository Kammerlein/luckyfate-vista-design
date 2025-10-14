import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, Wallet, Gift, Trophy, Camera, Edit3, Save, X, CreditCard, History, Upload, Package, Plus, Pencil, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  balance: number;
  display_name: string | null;
  avatar_url: string | null;
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

interface UserListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User listings state
  const [listings, setListings] = useState<UserListing[]>([]);
  const [showAddListing, setShowAddListing] = useState(false);
  const [editingListing, setEditingListing] = useState<string | null>(null);
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: null as File | null
  });
  const [uploadingListing, setUploadingListing] = useState(false);
  const listingImageRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
        .select('balance, display_name, avatar_url')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || session.user.email || '');
        console.log('Profile data:', profileData); // Debug log
        console.log('Avatar URL from profile:', profileData.avatar_url); // Debug log
      } else {
        console.log('No profile data found'); // Debug log
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
      
      // Fetch user listings
      const { data: listingsData } = await supabase
        .from('user_listings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (listingsData) {
        setListings(listingsData);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Будь ласка, оберіть зображення у форматі JPG, PNG або WebP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Розмір файлу не повинен перевищувати 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success('Аватар успішно оновлено!');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Помилка при завантаженні аватара');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Listing functions
  const resetListingForm = () => {
    setListingForm({
      title: '',
      description: '',
      price: '',
      category: '',
      image: null
    });
    setShowAddListing(false);
    setEditingListing(null);
    if (listingImageRef.current) {
      listingImageRef.current.value = '';
    }
  };

  const handleListingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Оберіть зображення у форматі JPG, PNG або WebP');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Розмір файлу не повинен перевищувати 5MB');
        return;
      }
      setListingForm(prev => ({ ...prev, image: file }));
    }
  };

  const handleSaveListing = async () => {
    if (!user) return;
    
    // Validation
    if (!listingForm.title.trim() || !listingForm.price || !listingForm.category) {
      toast.error('Заповніть всі обов\'язкові поля');
      return;
    }

    const price = parseFloat(listingForm.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Введіть коректну ціну');
      return;
    }

    setUploadingListing(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (listingForm.image) {
        const fileExt = listingForm.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, listingForm.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      if (editingListing) {
        // Update existing listing
        const updateData: any = {
          title: listingForm.title,
          description: listingForm.description,
          price,
          category: listingForm.category
        };
        
        if (imageUrl) {
          updateData.image = imageUrl;
        }

        const { error } = await supabase
          .from('user_listings')
          .update(updateData)
          .eq('id', editingListing)
          .eq('user_id', user.id);

        if (error) throw error;

        setListings(prev => prev.map(listing => 
          listing.id === editingListing 
            ? { ...listing, ...updateData } 
            : listing
        ));

        toast.success('Оголошення оновлено!');
      } else {
        // Create new listing
        const { data, error } = await supabase
          .from('user_listings')
          .insert({
            user_id: user.id,
            title: listingForm.title,
            description: listingForm.description,
            price,
            category: listingForm.category,
            image: imageUrl
          })
          .select()
          .single();

        if (error) throw error;

        setListings(prev => [data, ...prev]);
        toast.success('Оголошення додано!');
      }

      resetListingForm();
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error('Помилка при збереженні оголошення');
    } finally {
      setUploadingListing(false);
    }
  };

  const handleEditListing = (listing: UserListing) => {
    setListingForm({
      title: listing.title,
      description: listing.description || '',
      price: listing.price.toString(),
      category: listing.category,
      image: null
    });
    setEditingListing(listing.id);
    setShowAddListing(true);
  };

  const handleDeleteListing = async (id: string) => {
    if (!user || !confirm('Ви впевнені, що хочете видалити це оголошення?')) return;

    try {
      const { error } = await supabase
        .from('user_listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setListings(prev => prev.filter(listing => listing.id !== id));
      toast.success('Оголошення видалено!');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Помилка при видаленні оголошення');
    }
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
                    <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-2xl font-bold">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  
                  <Button
                    size="icon"
                    onClick={triggerFileInput}
                    disabled={uploadingAvatar}
                    className="absolute bottom-2 right-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                Огляд
              </TabsTrigger>
              <TabsTrigger value="tickets" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                Квитки
              </TabsTrigger>
              <TabsTrigger value="listings" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                Ваші оголошення
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

            {/* Listings Tab */}
            <TabsContent value="listings">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Ваші оголошення
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Додавайте та керуйте своїми товарами
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowAddListing(!showAddListing)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Додати товар
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add/Edit Listing Form */}
                  {showAddListing && (
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">
                          {editingListing ? 'Редагувати оголошення' : 'Додати новий товар'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="listing-title" className="text-white">Назва товару *</Label>
                          <Input
                            id="listing-title"
                            value={listingForm.title}
                            onChange={(e) => setListingForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Наприклад: iPhone 15 Pro Max"
                            className="bg-slate-600 border-slate-500 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="listing-category" className="text-white">Категорія *</Label>
                          <Select 
                            value={listingForm.category} 
                            onValueChange={(value) => setListingForm(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                              <SelectValue placeholder="Оберіть категорію" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Нерухомість">Нерухомість</SelectItem>
                              <SelectItem value="Транспорт">Транспорт</SelectItem>
                              <SelectItem value="Електроніка">Електроніка</SelectItem>
                              <SelectItem value="Смартфони">Смартфони</SelectItem>
                              <SelectItem value="Ювелірні вироби">Ювелірні вироби</SelectItem>
                              <SelectItem value="Косметика">Косметика</SelectItem>
                              <SelectItem value="Дитячі товари">Дитячі товари</SelectItem>
                              <SelectItem value="Спорт">Спорт</SelectItem>
                              <SelectItem value="Інструменти">Інструменти</SelectItem>
                              <SelectItem value="Туризм">Туризм</SelectItem>
                              <SelectItem value="Подарунки">Подарунки</SelectItem>
                              <SelectItem value="Послуги">Послуги</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="listing-price" className="text-white">Ціна (₴) *</Label>
                          <Input
                            id="listing-price"
                            type="number"
                            value={listingForm.price}
                            onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            className="bg-slate-600 border-slate-500 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="listing-description" className="text-white">Опис</Label>
                          <Textarea
                            id="listing-description"
                            value={listingForm.description}
                            onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Детальний опис товару..."
                            className="bg-slate-600 border-slate-500 text-white min-h-[100px]"
                          />
                        </div>

                        <div>
                          <Label htmlFor="listing-image" className="text-white">Зображення товару</Label>
                          <div className="flex items-center gap-2">
                            <input
                              ref={listingImageRef}
                              id="listing-image"
                              type="file"
                              accept="image/*"
                              onChange={handleListingImageChange}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => listingImageRef.current?.click()}
                              variant="outline"
                              className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {listingForm.image ? listingForm.image.name : 'Вибрати файл'}
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveListing}
                            disabled={uploadingListing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {uploadingListing ? 'Збереження...' : editingListing ? 'Зберегти зміни' : 'Додати оголошення'}
                          </Button>
                          <Button
                            onClick={resetListingForm}
                            variant="outline"
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            Скасувати
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Listings Grid */}
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listings.map((listing) => (
                        <Card key={listing.id} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            {listing.image && (
                              <img 
                                src={listing.image} 
                                alt={listing.title}
                                className="w-full h-48 object-cover rounded-lg mb-3"
                              />
                            )}
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="text-white font-semibold text-lg">{listing.title}</h4>
                                <Badge className="bg-yellow-500 text-black">{listing.category}</Badge>
                              </div>
                              {listing.description && (
                                <p className="text-slate-400 text-sm line-clamp-2">{listing.description}</p>
                              )}
                              <div className="flex items-center justify-between pt-2">
                                <span className="text-green-400 font-bold text-xl">{listing.price} ₴</span>
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    onClick={() => handleEditListing(listing)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    onClick={() => handleDeleteListing(listing.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : !showAddListing ? (
                    <div className="text-center py-12 text-slate-400">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">У вас поки немає оголошень</p>
                      <p className="text-sm">Натисніть кнопку "Додати товар" щоб створити перше оголошення</p>
                    </div>
                  ) : null}
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
                    <Button 
                      onClick={() => setActiveTab('wallet')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6"
                    >
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