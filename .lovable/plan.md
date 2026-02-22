

# Tripost — Travel Recommendations App

A travel spot library app inspired by the provided screenshots, built with React, Tailwind CSS, shadcn-ui, and Supabase.

---

## Pages & Layout

### Global Layout
- **Sidebar navigation** (collapsible) with links: Dashboard, Library, Itinerary, Settings, Trash
- Tripost branding with teal/cyan accent color scheme matching the screenshots
- Top bar with search input, notification bell, and user avatar
- Floating "+" add button in bottom-right corner

### 1. Dashboard (`/`)
- Three stat cards: Saved Spots, Active Itineraries, Countries Visited
- "Recently Added" horizontal carousel of recommendation cards
- "Discover Your Library" grid section with category/sort filters
- Cards show image, title, source badge, and "saved X ago" timestamp

### 2. Library (`/library`)
- Left filter panel: destination tags, category dropdown, tag chips, price range selector
- Grid/List toggle view
- Recommendation cards fetched from Supabase `recommendations` table
- Each card: image, category badge, location, title, tags, description snippet, "View Source" button
- **Clicking a card opens the Detail Drawer**

### 3. Detail Drawer (overlay)
- Full-width hero image with category badges and title overlay
- Location pin with city/country
- "About this destination" description
- Info chips: Opening Hours, Avg. Cost, Rating, Crowd Level
- Status indicator (Open/Closed)
- Map placeholder with address and "Open in Google Maps" link
- Action buttons: "Visit Source" and "+ Add to Itinerary"

### 4. Itinerary (`/itinerary`)
- Left panel: destination input, trip duration slider, travel style tags (Budget, Foodie, Adventure, etc.), "Generate Itinerary" button, saved places thumbnails
- Right panel: day-by-day timeline with morning/afternoon sections
- Each activity: thumbnail, title, description, duration & cost badges, remove button

### 5. Settings (`/settings`)
- Profile form: photo, name, username, bio
- Travel preferences: home airport, currency, eco-friendly toggle, public sharing toggle
- Connected services section (static/mock)
- Deactivate account section

---

## Supabase Backend

- **`recommendations` table** with columns: id, title, description, image_url, category, location, tags, source_url, source_type, rating, cost_range, opening_hours, created_at
- Data fetched via Supabase client with React Query
- Seed with sample travel data for demo purposes

---

## Design System
- Primary accent: **teal/cyan** (`#00D4AA` style)
- Secondary accent: **orange** for action buttons (Visit Source, Save Profile)
- Light warm background tones
- Rounded cards with subtle shadows
- Clean typography with bold headings

