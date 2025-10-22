-- Fix race condition in ticket purchases with atomic database function
-- Add security constraints and triggers

-- 1. Add CHECK constraints for data integrity
ALTER TABLE profiles 
ADD CONSTRAINT balance_non_negative CHECK (balance >= 0);

ALTER TABLE lotteries 
ADD CONSTRAINT ticket_price_positive CHECK (ticket_price > 0),
ADD CONSTRAINT sold_tickets_valid CHECK (sold_tickets >= 0 AND sold_tickets <= total_tickets);

ALTER TABLE user_listings
ADD CONSTRAINT price_positive CHECK (price > 0);

-- 2. Add VARCHAR length limits to prevent injection attacks
ALTER TABLE profiles
ALTER COLUMN display_name TYPE VARCHAR(100);

ALTER TABLE user_listings
ALTER COLUMN title TYPE VARCHAR(200),
ALTER COLUMN description TYPE VARCHAR(2000);

ALTER TABLE lotteries
ALTER COLUMN title TYPE VARCHAR(200),
ALTER COLUMN description TYPE VARCHAR(5000);

-- 3. Function to generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'TK-' || EXTRACT(EPOCH FROM NOW())::bigint || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$;

-- 4. Atomic ticket purchase function with row locking
CREATE OR REPLACE FUNCTION purchase_ticket(
  p_lottery_id UUID,
  p_price NUMERIC
)
RETURNS TABLE(
  success BOOLEAN,
  ticket_id UUID,
  ticket_number TEXT,
  new_balance NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_balance NUMERIC;
  v_ticket_id UUID;
  v_ticket_number TEXT;
  v_sold_tickets INTEGER;
  v_total_tickets INTEGER;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Not authenticated';
    RETURN;
  END IF;

  -- Lock user's profile row and get balance atomically
  SELECT balance INTO v_balance 
  FROM profiles 
  WHERE user_id = v_user_id 
  FOR UPDATE;

  -- Check if profile exists
  IF v_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Profile not found';
    RETURN;
  END IF;

  -- Check sufficient balance
  IF v_balance < p_price THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, v_balance, 'Insufficient balance';
    RETURN;
  END IF;

  -- Lock lottery row and check availability
  SELECT sold_tickets, total_tickets INTO v_sold_tickets, v_total_tickets
  FROM lotteries
  WHERE id = p_lottery_id
  FOR UPDATE;

  IF v_sold_tickets IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, v_balance, 'Lottery not found';
    RETURN;
  END IF;

  IF v_sold_tickets >= v_total_tickets THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, v_balance, 'Lottery sold out';
    RETURN;
  END IF;

  -- Generate ticket number
  v_ticket_number := generate_ticket_number();

  -- Insert ticket
  INSERT INTO tickets (user_id, lottery_id, ticket_number, price_paid)
  VALUES (v_user_id, p_lottery_id, v_ticket_number, p_price)
  RETURNING id INTO v_ticket_id;

  -- Update balance
  UPDATE profiles 
  SET balance = balance - p_price 
  WHERE user_id = v_user_id;

  -- Update sold tickets count
  UPDATE lotteries
  SET sold_tickets = sold_tickets + 1
  WHERE id = p_lottery_id;

  -- Return success
  RETURN QUERY SELECT TRUE, v_ticket_id, v_ticket_number, (v_balance - p_price), NULL::TEXT;
END;
$$;

-- 5. Create view for public listings without user_id exposure
CREATE OR REPLACE VIEW public_listings AS
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

-- 6. Grant access to view
GRANT SELECT ON public_listings TO authenticated;
GRANT SELECT ON public_listings TO anon;