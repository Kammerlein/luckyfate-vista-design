
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[80vh] bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-amber-400/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-yellow-300/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-teal-300/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-yellow-200 to-amber-300 bg-clip-text text-transparent animate-fade-in">
            <span className="block mb-4">Виграйте</span>
            <span className="text-yellow-400 drop-shadow-lg">дивовижні призи</span>
            <span className="block mt-4">на нашому маркетплейсі</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-teal-100 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Приєднуйтесь до тисяч щасливчиків, які вже виграли нерухомість, автомобілі, електроніку та багато іншого!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-yellow-500/50"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ознайомтеся з лотереями
            </Button>
            
            <Button 
              onClick={() => navigate('/auth')}
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-slate-800 hover:bg-white hover:text-teal-800 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 backdrop-blur-sm"
            >
              <Gift className="w-5 h-5 mr-2" />
              Приєднатися зараз
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">50K+</div>
              <div className="text-teal-200 text-sm md:text-base">Щасливих переможців</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">₴10M+</div>
              <div className="text-teal-200 text-sm md:text-base">Виграшних призів</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-teal-200 text-sm md:text-base">Активних лотерей</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
