-- Allow everyone to view active listings in marketplace
CREATE POLICY "Active listings are viewable by everyone"
ON public.user_listings
FOR SELECT
USING (status = 'active');