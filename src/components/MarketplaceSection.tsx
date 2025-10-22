
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';

const products = [
  {
    id: 1,
    title: 'Apple Watch Series 9',
    price: 12500,
    originalPrice: 15000,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop',
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    title: 'Samsung Galaxy Buds Pro',
    price: 4500,
    originalPrice: 6000,
    image: 'https://images.unsplash.com/photo-1590658165737-15a047b7e0d4?w=400&h=300&fit=crop',
    rating: 4.6,
    reviews: 89
  },
  {
    id: 3,
    title: 'Dyson V15 Detect',
    price: 18000,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1558618644-fcd25c85cd64?w=400&h=300&fit=crop',
    rating: 4.9,
    reviews: 156
  },
  {
    id: 4,
    title: 'Canon EOS R6',
    price: 65000,
    originalPrice: 80000,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 78
  }
];

const MarketplaceSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Маркетплейс товарів</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Купуйте якісні товари за вигідними цінами або беріть участь у лотереях, щоб виграти їх безкоштовно!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">
                  {product.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-teal-600">{product.price.toLocaleString()} ₴</span>
                    <div className="text-sm text-gray-500 line-through">
                      {product.originalPrice.toLocaleString()} ₴
                    </div>
                  </div>
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
