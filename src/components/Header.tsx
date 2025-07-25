
import React, { useState, useEffect } from 'react';
import { Wallet, User, Home, Ticket, Trophy, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthAction = async () => {
    if (user) {
      // User is logged in, so log them out
      await supabase.auth.signOut();
    } else {
      // User is not logged in, navigate to auth page
      navigate('/auth');
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-700 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-900 to-slate-900 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
              LuckyFate
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="text-white hover:text-yellow-400 transition-all duration-300 font-medium flex items-center space-x-2 hover:scale-105"
            >
              <Home className="w-4 h-4" />
              <span>Головна</span>
            </button>
            <button 
              onClick={() => navigate('/categories')}
              className="text-white hover:text-yellow-400 transition-all duration-300 font-medium hover:scale-105"
            >
              Категорії
            </button>
            <button 
              onClick={() => navigate('/winners')}
              className="text-white hover:text-yellow-400 transition-all duration-300 font-medium hover:scale-105"
            >
              Наші переможці
            </button>
            {user && (
              <button 
                onClick={() => navigate('/my-tickets')}
                className="text-white hover:text-yellow-400 transition-all duration-300 font-medium flex items-center space-x-2 hover:scale-105"
              >
                <Ticket className="w-4 h-4" />
                <span>Мої квитки</span>
              </button>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-white/30 transition-all duration-300">
              <Wallet className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">2,500 ₴</span>
            </div>
            
            {/* Profile Button */}
            <Button 
              onClick={() => navigate(user ? '/profile' : '/auth')}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2" />
              Профіль
            </Button>
            
            {/* Login/Logout Button */}
            <Button 
              onClick={handleAuthAction}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {user ? (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Вихід
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Вхід
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
