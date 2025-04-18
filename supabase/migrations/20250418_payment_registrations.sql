-- Add registration_id field to payments table to support event registrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'registration_id'
  ) THEN
    ALTER TABLE public.payments 
    ADD COLUMN registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Update RLS policies to handle registration-based payments
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view their own payments'
  ) THEN
    DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
  END IF;
  
  CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (
      -- Payment is linked to user's registration
      registration_id IN (SELECT id FROM event_registrations WHERE user_id = auth.uid())
    );
END
$$;

-- Update trigger function to handle registration payments
CREATE OR REPLACE FUNCTION public.handle_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If updating payment status to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Update registration status
    IF NEW.registration_id IS NOT NULL THEN
      UPDATE event_registrations
      SET payment_status = 'completed', status = 'confirmed'
      WHERE id = NEW.registration_id;
    END IF;
  END IF;
  
  -- If updating payment status to failed
  IF OLD.status != 'failed' AND NEW.status = 'failed' THEN
    -- Update registration status
    IF NEW.registration_id IS NOT NULL THEN
      UPDATE event_registrations
      SET payment_status = 'failed', status = 'cancelled'
      WHERE id = NEW.registration_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
