-- Create event_registrations table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attendees INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Users can view their own registrations'
  ) THEN
    CREATE POLICY "Users can view their own registrations"
      ON event_registrations FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Event organizers can view registrations for their events
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Event organizers can view registrations for their events'
  ) THEN
    CREATE POLICY "Event organizers can view registrations for their events"
      ON event_registrations FOR SELECT
      USING (
        auth.uid() IN (
          SELECT organizer_id FROM events WHERE id = event_id
        )
      );
  END IF;
END
$$;

-- Users can create their own registrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Users can create their own registrations'
  ) THEN
    CREATE POLICY "Users can create their own registrations"
      ON event_registrations FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Users can update their own registrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Users can update their own registrations'
  ) THEN
    CREATE POLICY "Users can update their own registrations"
      ON event_registrations FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Users can delete their own registrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Users can delete their own registrations'
  ) THEN
    CREATE POLICY "Users can delete their own registrations"
      ON event_registrations FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;
