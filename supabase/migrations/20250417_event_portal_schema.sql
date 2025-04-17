-- Migration: Event Portal Database Schema
-- Date: 2025-04-17

-- Step 1: Create profiles table first (required for foreign key references)

-- Create profiles table for users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Step 2: Create event-related tables

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  price DECIMAL NOT NULL,
  capacity INTEGER NOT NULL,
  registered_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  attendees INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create event_categories table for better organization
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default categories
INSERT INTO event_categories (name, description)
VALUES 
  ('Conference', 'Professional gatherings and conferences'),
  ('Workshop', 'Interactive learning sessions'),
  ('Seminar', 'Educational events'),
  ('Concert', 'Musical performances'),
  ('Exhibition', 'Art and cultural exhibitions'),
  ('Festival', 'Celebrations and festivals'),
  ('Networking', 'Business and social networking events'),
  ('Other', 'Miscellaneous events')
ON CONFLICT (name) DO NOTHING;

-- Create payments table for event registrations
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  provider TEXT NOT NULL,
  transaction_id TEXT,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payment_receipts table
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  receipt_url TEXT,
  receipt_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 3: Set up row-level security policies for event tables

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Public events are viewable by everyone"
  ON events FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can manage all events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Event registrations policies
CREATE POLICY "Users can view their own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON event_registrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view registrations for their events"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all registrations"
  ON event_registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Event categories policies
CREATE POLICY "Event categories are viewable by everyone"
  ON event_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage event categories"
  ON event_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all settings"
  ON user_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any setting"
  ON user_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM event_registrations WHERE id = registration_id));

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM event_registrations WHERE id = registration_id));

CREATE POLICY "Users can update their own payments"
  ON payments FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM event_registrations WHERE id = registration_id));

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any payment"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Payment receipts policies
CREATE POLICY "Users can view their own payment receipts"
  ON payment_receipts FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM event_registrations WHERE id = (SELECT registration_id FROM payments WHERE id = payment_id)));

CREATE POLICY "Users can create payment receipts"
  ON payment_receipts FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM event_registrations WHERE id = (SELECT registration_id FROM payments WHERE id = payment_id)));

CREATE POLICY "Users can update their own payment receipts"
  ON payment_receipts FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM event_registrations WHERE id = (SELECT registration_id FROM payments WHERE id = payment_id)));

CREATE POLICY "Admins can view all payment receipts"
  ON payment_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any payment receipt"
  ON payment_receipts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 4: Create or modify necessary functions and triggers

-- Function to update registered_attendees count on event
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment the registered_attendees count
    UPDATE events
    SET registered_attendees = registered_attendees + NEW.attendees
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update the registered_attendees count based on the difference
    UPDATE events
    SET registered_attendees = registered_attendees - OLD.attendees + NEW.attendees
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement the registered_attendees count
    UPDATE events
    SET registered_attendees = registered_attendees - OLD.attendees
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for event_registrations to update registered_attendees count
CREATE TRIGGER update_event_attendees_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON event_registrations
FOR EACH ROW
EXECUTE FUNCTION update_event_attendees_count();
