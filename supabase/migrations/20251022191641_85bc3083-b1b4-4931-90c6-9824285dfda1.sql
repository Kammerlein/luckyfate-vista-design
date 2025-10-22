-- Fix: Remove SECURITY DEFINER from public_listings view
-- This view should use the querying user's permissions, not the creator's

DROP VIEW IF EXISTS public.public_listings;

CREATE VIEW public.public_listings AS 
SELECT 
  id, 
  title, 
  description, 
  price, 
  category, 
  image, 
  status, 
  created_at, 
  updated_at 
FROM public.user_listings 
WHERE status = 'active';

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.public_listings TO authenticated;

-- Grant SELECT permission to anon users for public marketplace access
GRANT SELECT ON public.public_listings TO anon;