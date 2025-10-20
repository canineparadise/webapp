-- Create incidents table for tracking daycare incidents
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Incident details
  incident_type TEXT NOT NULL, -- 'injury', 'illness', 'behavioral', 'other'
  severity TEXT NOT NULL, -- 'minor', 'moderate', 'serious'
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Related entities
  dog_id UUID REFERENCES public.dogs(id) ON DELETE SET NULL,
  reported_by_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- When and where
  occurred_at TIMESTAMPTZ NOT NULL,
  location TEXT, -- 'indoor play area', 'outdoor yard', 'reception', etc.

  -- Actions taken
  action_taken TEXT,
  vet_notified BOOLEAN DEFAULT false,
  owner_notified BOOLEAN DEFAULT false,
  owner_notified_at TIMESTAMPTZ,

  -- Follow up
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Staff and admin can view all incidents
CREATE POLICY "Staff and admin can view incidents"
  ON public.incidents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Staff and admin can insert incidents
CREATE POLICY "Staff and admin can create incidents"
  ON public.incidents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Staff and admin can update incidents
CREATE POLICY "Staff and admin can update incidents"
  ON public.incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incidents_updated_at();

-- Create index for faster queries
CREATE INDEX incidents_occurred_at_idx ON public.incidents(occurred_at DESC);
CREATE INDEX incidents_dog_id_idx ON public.incidents(dog_id);
CREATE INDEX incidents_resolved_idx ON public.incidents(resolved);
