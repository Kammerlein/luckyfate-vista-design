import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  description: string | null;
  category: string;
  created_at: string;
}

const MarketplaceSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити товари",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Маркетплейс товарів</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Купуйте якісні товари за вигідними цінами або беріть участь у лотереях, щоб виграти їх безкоштовно!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Завантаження товарів...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Немає доступних товарів</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <Card
                key={product.id}
                className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.category}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-teal-600">
                      {Number(product.price).toLocaleString()} ₴
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Купити зараз
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white font-semibold rounded-full transition-all duration-300"
                    >
                      Виграти в лотереї
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Переглянути всі товари
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceSection;
