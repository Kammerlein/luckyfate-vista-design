-- Перенести 4 лотереї з "Електроніка" у таблицю user_listings для користувача vova.kab46@ukr.net

INSERT INTO user_listings (user_id, title, description, image, price, category, status, created_at)
VALUES 
  ('670c67e7-d9a8-4960-bb18-59c1c3163129', 'MacBook Pro M3', 'Потужний ноутбук для професіоналів', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop', 200.00, 'Електроніка', 'active', '2025-07-26 11:04:14.124907+00'),
  ('670c67e7-d9a8-4960-bb18-59c1c3163129', 'iPhone 15 Pro Max', 'Найновіший смартфон від Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', 150.00, 'Електроніка', 'active', '2025-07-26 11:04:14.124907+00'),
  ('670c67e7-d9a8-4960-bb18-59c1c3163129', 'MacBook Pro 14" M3', 'Потужний ноутбук для професіоналів', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQyjXLioJFxfH6rjKXGvN_HW_NWP5dkY5puQ&s', 150.00, 'Електроніка', 'active', '2025-07-25 18:13:28.741188+00'),
  ('670c67e7-d9a8-4960-bb18-59c1c3163129', 'PlayStation 5', 'Нова ігрова консоль від Sony', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSJWu72VOeleFIYo_U1g4Gaf0WoXwKDcXGVw&s', 75.00, 'Електроніка', 'active', '2025-07-25 18:13:28.741188+00');