-- Add verification code table for event registrations
CREATE TABLE IF NOT EXISTS registration_verification_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(6) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE registration_verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for verification codes
CREATE POLICY "Users can view their own verification codes"
  ON registration_verification_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_registrations
      WHERE event_registrations.id = registration_id
      AND event_registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert verification codes for their registrations"
  ON registration_verification_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_registrations
      WHERE event_registrations.id = registration_id
      AND event_registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own verification codes"
  ON registration_verification_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_registrations
      WHERE event_registrations.id = registration_id
      AND event_registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all verification codes"
  ON registration_verification_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to verify registration code
CREATE OR REPLACE FUNCTION verify_registration_code(registration_id UUID, code VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  valid_code BOOLEAN;
BEGIN
  -- Check if the code exists, is not expired, and matches the provided code
  UPDATE registration_verification_codes
  SET verified = TRUE
  WHERE registration_verification_codes.registration_id = verify_registration_code.registration_id
  AND registration_verification_codes.code = verify_registration_code.code
  AND registration_verification_codes.expires_at > NOW()
  AND registration_verification_codes.verified = FALSE
  RETURNING TRUE INTO valid_code;
  
  -- If the code was valid, update the registration status
  IF valid_code THEN
    UPDATE event_registrations
    SET status = 'confirmed'
    WHERE id = registration_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
