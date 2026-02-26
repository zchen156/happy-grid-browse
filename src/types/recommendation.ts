export interface Recommendation {
  id: string;
  title: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[];
  category: string;
  location: string | null;
  destination: string | null;
  tags: string[];
  source_url: string | null;
  source_type: string | null;
  rating: number | null;
  cost_range: string | null;
  price_range: string | null;
  opening_hours: string | null;
  crowd_level: string | null;
  address: string | null;
  tips: string | null;
  video_timestamp: string | null;
  created_at: string;
}
