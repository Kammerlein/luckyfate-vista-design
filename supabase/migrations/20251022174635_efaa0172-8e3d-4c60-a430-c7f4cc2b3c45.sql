-- Fix security linter warnings

-- 1. Fix function search path for generate_ticket_number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'TK-' || EXTRACT(EPOCH FROM NOW())::bigint || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$;

-- 2. Drop the view and recreate it without security definer
-- Views should not use security definer as they enforce creator's permissions
DROP VIEW IF EXISTS public_listings;

CREATE VIEW public_listings AS
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
FROM user_listings
WHERE status = 'active';

-- Grant proper access
GRANT SELECT ON public_listings TO authenticated;
GRANT SELECT ON public_listings TO anon;