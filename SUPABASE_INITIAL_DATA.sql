-- ============================================
-- SUPABASE INITIAL DATA SETUP
-- Run this AFTER running SUPABASE_SCHEMA.sql
-- ============================================

-- ============================================
-- STEP 1: Create Admin User in Supabase Auth
-- ============================================
-- You MUST do this in Supabase Dashboard first:
-- 1. Go to Authentication → Users → Add User
-- 2. Email: admin@chitrakalakar.com
-- 3. Password: admin123
-- 4. Email Confirm: YES (mark as confirmed)
-- 5. Copy the User ID (UUID) that gets generated
-- 6. Replace 'YOUR_ADMIN_USER_ID' below with that UUID

-- ============================================
-- STEP 2: Create Admin Profile in Database
-- ============================================
-- Replace 'YOUR_ADMIN_USER_ID' with the actual UUID from Step 1

INSERT INTO public.users (
  id,
  name,
  email,
  role,
  categories,
  location,
  bio,
  is_approved,
  is_active,
  joined_at
) VALUES (
  'YOUR_ADMIN_USER_ID'::uuid,  -- ⚠️ REPLACE THIS
  'ChitraKalakar Admin',
  'admin@chitrakalakar.com',
  'admin',
  ARRAY[]::text[],
  'India',
  'Platform Administrator',
  true,
  true,
  NOW()
);

-- ============================================
-- STEP 3: Verify Admin User Created
-- ============================================
-- Run this query to verify:
SELECT id, name, email, role, is_approved, is_active 
FROM public.users 
WHERE email = 'admin@chitrakalakar.com';

-- ============================================
-- OPTIONAL: Create Sample Featured Artist
-- ============================================
INSERT INTO public.featured_artists (
  name,
  bio,
  avatar,
  categories,
  location,
  artworks,
  type,
  is_featured
) VALUES (
  'Raja Ravi Varma',
  'Raja Ravi Varma was an Indian painter and artist. He is considered among the greatest painters in the history of Indian art.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Raja_Ravi_Varma%2C_self-portrait.jpg/330px-Raja_Ravi_Varma%2C_self-portrait.jpg',
  ARRAY['Oil Painting', 'Portrait'],
  'Kerala, India',
  '[]'::jsonb,
  'contemporary',
  true
);

-- ============================================
-- OPTIONAL: Create Test Artist User
-- ============================================
-- First create in Supabase Auth Dashboard:
-- Email: artist@test.com
-- Password: test123
-- Then insert profile (replace UUID):

-- INSERT INTO public.users (
--   id,
--   name,
--   email,
--   role,
--   categories,
--   location,
--   is_approved,
--   is_active,
--   joined_at
-- ) VALUES (
--   'TEST_ARTIST_UUID'::uuid,
--   'Test Artist',
--   'artist@test.com',
--   'artist',
--   ARRAY['Watercolor', 'Acrylic'],
--   'Mumbai, India',
--   true,
--   true,
--   NOW()
-- );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total users
SELECT role, COUNT(*) as count 
FROM public.users 
GROUP BY role;

-- Check featured artists
SELECT name, type, is_featured 
FROM public.featured_artists;

-- Check RLS policies are enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
