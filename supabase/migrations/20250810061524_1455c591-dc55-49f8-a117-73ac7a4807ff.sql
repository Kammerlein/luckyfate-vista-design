-- Add a test avatar URL to check functionality
UPDATE profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' 
WHERE user_id = (SELECT user_id FROM profiles LIMIT 1);