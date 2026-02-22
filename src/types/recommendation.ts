export interface Recommendation {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  location: string | null;
  tags: string[];
  source_url: string | null;
  source_type: string | null;
  rating: number | null;
  cost_range: string | null;
  opening_hours: string | null;
  crowd_level: string | null;
  address: string | null;
  created_at: string;
}
