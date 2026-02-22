
-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Restaurant',
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  source_type TEXT DEFAULT 'Manual',
  rating NUMERIC(2,1),
  cost_range TEXT,
  opening_hours TEXT,
  crowd_level TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Public read access for demo (no auth required)
CREATE POLICY "Anyone can read recommendations"
  ON public.recommendations FOR SELECT
  USING (true);

-- Allow inserts for demo
CREATE POLICY "Anyone can insert recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (true);

-- Seed sample data
INSERT INTO public.recommendations (title, description, image_url, category, location, tags, source_url, source_type, rating, cost_range, opening_hours, crowd_level, address) VALUES
('Shizen Vegan Sushi', 'An innovative vegan sushi bar offering plant-based rolls and Japanese-inspired dishes in a stylish setting.', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 'Restaurant', 'San Francisco, USA', ARRAY['Vegan', 'Sushi', 'Japanese'], 'https://example.com', 'Instagram', 4.8, '$$', '11:30 AM - 9:00 PM', 'Moderate', '370 14th St, San Francisco, CA'),
('Kinkaku-ji Temple', 'The Golden Pavilion is one of Japan''s most iconic landmarks, surrounded by stunning gardens and reflecting pools.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'Attraction', 'Kyoto, Japan', ARRAY['Temple', 'Historic', 'Gardens'], 'https://example.com', 'TikTok', 4.9, '$', '9:00 AM - 5:00 PM', 'High', '1 Kinkakujicho, Kita Ward, Kyoto'),
('Café de Flore', 'A historic Parisian café frequented by intellectuals, serving classic French coffee and pastries since 1887.', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', 'Café', 'Paris, France', ARRAY['Coffee', 'Historic', 'Breakfast'], 'https://example.com', 'Blog', 4.5, '$$$', '7:30 AM - 1:30 AM', 'High', '172 Bd Saint-Germain, 75006 Paris'),
('Trolltunga Hike', 'A breathtaking cliff jutting out 700m above Lake Ringedalsvatnet, offering one of Norway''s most spectacular views.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Activity', 'Odda, Norway', ARRAY['Hiking', 'Nature', 'Adventure'], 'https://example.com', 'YouTube', 4.7, '$', '6:00 AM - 6:00 PM', 'Low', 'Trolltunga, Odda, Norway'),
('Bali Floating Breakfast', 'Experience a luxurious floating breakfast in an infinity pool overlooking the Ubud jungle — a bucket-list must.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'Experience', 'Ubud, Bali', ARRAY['Luxury', 'Breakfast', 'Pool'], 'https://example.com', 'Instagram', 4.6, '$$$$', '7:00 AM - 10:00 AM', 'Low', 'Ubud, Bali, Indonesia'),
('Borough Market', 'London''s most renowned food market with over 100 stalls offering artisan produce, street food, and gourmet delights.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', 'Market', 'London, UK', ARRAY['Food', 'Market', 'Street Food'], 'https://example.com', 'Manual', 4.4, '$$', '10:00 AM - 5:00 PM', 'High', '8 Southwark St, London SE1 1TL'),
('Santorini Sunset', 'Watch the world-famous sunset from Oia village, where white-washed buildings meet the deep blue Aegean Sea.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'Attraction', 'Santorini, Greece', ARRAY['Sunset', 'Views', 'Romantic'], 'https://example.com', 'TikTok', 4.9, 'Free', 'All day', 'Moderate', 'Oia, Santorini, Greece'),
('Ramen Ichiran', 'Solo dining perfected — enjoy rich tonkotsu ramen in private booths with customizable flavor profiles.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', 'Restaurant', 'Tokyo, Japan', ARRAY['Ramen', 'Solo', 'Japanese'], 'https://example.com', 'Blog', 4.6, '$', '10:00 AM - 7:00 AM', 'Moderate', '1-22-7 Jinnan, Shibuya, Tokyo');
