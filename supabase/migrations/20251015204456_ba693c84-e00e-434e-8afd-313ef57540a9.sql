-- Add status column to user_listings table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE listing_status AS ENUM ('active', 'archived', 'deleted');
  END IF;
END $$;

ALTER TABLE user_listings 
ADD COLUMN IF NOT EXISTS status listing_status NOT NULL DEFAULT 'active';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_listings_status ON user_listings(status);
CREATE INDEX IF NOT EXISTS idx_user_listings_user_status ON user_listings(user_id, status);