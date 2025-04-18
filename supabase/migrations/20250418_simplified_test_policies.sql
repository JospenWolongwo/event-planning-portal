-- Migration: Simplified Test Policies for Event Portal
-- Date: 2025-04-18
-- Purpose: Make the application easier to test by allowing all authenticated users to manage events

-- Drop existing event policies first
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;

-- Create new simplified policies for events
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Any authenticated user can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Any authenticated user can update events"
  ON events FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Any authenticated user can delete events"
  ON events FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Fix storage permissions for event images
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;

-- Create policy for viewing images (public)
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

-- Create policy for uploads (authenticated users only)
CREATE POLICY "Any authenticated user can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

-- Create separate policies for updating and deleting images (authenticated users only)
CREATE POLICY "Any authenticated user can update images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Any authenticated user can delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);
