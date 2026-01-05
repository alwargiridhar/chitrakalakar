# Supabase Database Schema for ChitraKalakar

## Create these tables in your Supabase SQL Editor

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- user, artist, admin, lead_chitrakar, kalakar, institution
  categories TEXT[] DEFAULT '{}',
  location TEXT,
  bio TEXT,
  avatar TEXT,
  phone TEXT,
  teaching_rate NUMERIC,
  teaches_online BOOLEAN DEFAULT FALSE,
  teaches_offline BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks table
CREATE TABLE public.artworks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exhibitions table
CREATE TABLE public.exhibitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  artwork_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming', -- upcoming, active, completed, archived
  views INT DEFAULT 0,
  exhibition_type TEXT DEFAULT 'Kalakanksh', -- Kalakanksh, Kalahruday, KalaDeeksh
  fees NUMERIC DEFAULT 1000,
  days_paid INT DEFAULT 3,
  max_artworks INT DEFAULT 10,
  additional_artworks INT DEFAULT 0,
  additional_artwork_fee NUMERIC DEFAULT 0,
  voluntary_platform_fee NUMERIC DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  archive_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Featured Artists table
CREATE TABLE public.featured_artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  categories TEXT[] DEFAULT '{}',
  location TEXT,
  artworks JSONB DEFAULT '[]',
  type TEXT DEFAULT 'contemporary', -- contemporary, registered
  artist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Art Class Enquiries table
CREATE TABLE public.art_class_enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_location TEXT,
  art_type TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  duration TEXT NOT NULL,
  budget_range TEXT,
  class_type TEXT NOT NULL, -- online, offline
  status TEXT DEFAULT 'pending', -- pending, matched, expired
  matched_artists UUID[] DEFAULT '{}',
  contacts_revealed UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  artist_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_class_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Public users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for artworks table
CREATE POLICY "Artworks are viewable by everyone"
  ON public.artworks FOR SELECT
  USING (true);

CREATE POLICY "Artists can insert own artworks"
  ON public.artworks FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update own artworks"
  ON public.artworks FOR UPDATE
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete own artworks"
  ON public.artworks FOR DELETE
  USING (auth.uid() = artist_id);

-- RLS Policies for exhibitions table
CREATE POLICY "Exhibitions are viewable by everyone"
  ON public.exhibitions FOR SELECT
  USING (true);

CREATE POLICY "Artists can insert own exhibitions"
  ON public.exhibitions FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update own exhibitions"
  ON public.exhibitions FOR UPDATE
  USING (auth.uid() = artist_id);

-- RLS Policies for featured_artists table
CREATE POLICY "Featured artists are viewable by everyone"
  ON public.featured_artists FOR SELECT
  USING (true);

-- RLS Policies for art_class_enquiries table
CREATE POLICY "Users can view own enquiries"
  ON public.art_class_enquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enquiries"
  ON public.art_class_enquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for orders table
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = artist_id);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX idx_artworks_category ON public.artworks(category);
CREATE INDEX idx_exhibitions_artist_id ON public.exhibitions(artist_id);
CREATE INDEX idx_exhibitions_status ON public.exhibitions(status);
CREATE INDEX idx_enquiries_user_id ON public.art_class_enquiries(user_id);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_artist_id ON public.orders(artist_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON public.artworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON public.exhibitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_artists_updated_at BEFORE UPDATE ON public.featured_artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Storage Buckets Setup

Create these storage buckets in Supabase Dashboard → Storage:

### 1. avatars bucket
```sql
-- Allow public read access
CREATE POLICY "Public avatars are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow users to update own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. artworks bucket
```sql
-- Allow public read access
CREATE POLICY "Public artworks are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload artworks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');
```

### 3. exhibitions bucket
```sql
-- Allow public read access
CREATE POLICY "Public exhibitions are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'exhibitions');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload exhibition images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exhibitions' AND auth.role() = 'authenticated');
```
