/*
  # Add Kids Products to Database

  1. New Products
    - Adding 6 lottery items for "Дитячі товари" category
    - Each product includes title, description, image, pricing, and timing
    - Products include toys, educational items, and kids gadgets

  2. Product Details
    - LEGO Creator Expert Set - building set for creativity
    - Nintendo Switch OLED - gaming console for kids
    - iPad Air for Kids - educational tablet
    - Electric Scooter - outdoor activity item
    - Educational Robot - STEM learning toy
    - Kids Smartwatch - safety and fun device
*/

INSERT INTO public.lotteries (title, description, image, ticket_price, total_tickets, sold_tickets, end_time, category) VALUES
('LEGO Creator Expert Модульний будинок', 'Великий конструктор LEGO для розвитку творчості та логіки', 'https://images.unsplash.com/photo-1558618644-fcd25c85cd64?w=400&h=300&fit=crop', 75, 200, 45, NOW() + INTERVAL '8 days', 'Дитячі товари'),
('Nintendo Switch OLED для дітей', 'Ігрова консоль з яскравим екраном та сімейними іграми', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop', 120, 150, 67, NOW() + INTERVAL '6 days', 'Дитячі товари'),
('iPad Air з дитячими додатками', 'Планшет для навчання та розваг з освітніми програмами', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop', 200, 100, 23, NOW() + INTERVAL '12 days', 'Дитячі товари'),
('Електричний самокат для дітей', 'Безпечний електросамокат з LED підсвіткою', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop', 90, 80, 34, NOW() + INTERVAL '4 days', 'Дитячі товари'),
('Навчальний робот Cozmo', 'Інтерактивний робот для вивчення програмування', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', 110, 120, 56, NOW() + INTERVAL '9 days', 'Дитячі товари'),
('Дитячий розумний годинник', 'Смарт-годинник з GPS трекером та іграми', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', 60, 250, 89, NOW() + INTERVAL '5 days', 'Дитячі товари');