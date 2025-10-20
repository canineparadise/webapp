-- ============================================
-- ROLL CALLS TABLE
-- ============================================
-- Track daily roll calls at 11am and 5pm to verify which dogs are present

CREATE TABLE IF NOT EXISTS public.roll_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Roll call info
  roll_call_date DATE NOT NULL,
  roll_call_time TEXT NOT NULL CHECK (roll_call_time IN ('11am', '5pm')),

  -- Who conducted the roll call
  conducted_by_staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Dogs present at roll call (array of dog IDs that were checked off as present)
  dogs_present UUID[] DEFAULT '{}',

  -- Dogs expected (based on bookings for that day)
  dogs_expected UUID[] DEFAULT '{}',

  -- Dogs missing (expected but not present)
  dogs_missing UUID[] DEFAULT '{}',

  -- Notes
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one roll call per date/time combination
  UNIQUE(roll_call_date, roll_call_time)
);

-- ============================================
-- STAFF ASSIGNMENTS TABLE
-- ============================================
-- Track which staff members are assigned to which areas/playgrounds

CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assignment details
  assignment_date DATE NOT NULL,
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Area/Location assignment
  area_type TEXT NOT NULL CHECK (area_type IN ('playground_1', 'playground_2', 'playground_3', 'indoor_play', 'reception', 'feeding_area', 'grooming', 'other')),
  area_name TEXT, -- Custom name if "other"

  -- Time slot
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,

  -- Assignment details
  assignment_notes TEXT,
  assigned_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STAFF TASKS TABLE
-- ============================================
-- Admin can assign specific tasks to staff members

CREATE TABLE IF NOT EXISTS public.staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task details
  task_date DATE NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Assignment
  assigned_to_staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Time
  due_time TIME,
  estimated_duration_minutes INTEGER,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Roll calls indexes
CREATE INDEX IF NOT EXISTS idx_roll_calls_date ON public.roll_calls(roll_call_date DESC);
CREATE INDEX IF NOT EXISTS idx_roll_calls_staff ON public.roll_calls(conducted_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_roll_calls_status ON public.roll_calls(status);

-- Staff assignments indexes
CREATE INDEX IF NOT EXISTS idx_staff_assignments_date ON public.staff_assignments(assignment_date DESC);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff ON public.staff_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_area ON public.staff_assignments(area_type);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_status ON public.staff_assignments(status);

-- Staff tasks indexes
CREATE INDEX IF NOT EXISTS idx_staff_tasks_date ON public.staff_tasks(task_date DESC);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to ON public.staff_tasks(assigned_to_staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON public.staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_priority ON public.staff_tasks(priority);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Roll calls RLS
ALTER TABLE public.roll_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all roll calls"
  ON public.roll_calls FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can create roll calls"
  ON public.roll_calls FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can update roll calls"
  ON public.roll_calls FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Staff assignments RLS
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all assignments"
  ON public.staff_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Admin can manage assignments"
  ON public.staff_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Staff can check in/out of assignments"
  ON public.staff_assignments FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

-- Staff tasks RLS
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own tasks"
  ON public.staff_tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to_staff_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage all tasks"
  ON public.staff_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Staff can update their own task status"
  ON public.staff_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to_staff_id = auth.uid())
  WITH CHECK (assigned_to_staff_id = auth.uid());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Roll calls trigger
CREATE OR REPLACE FUNCTION update_roll_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roll_calls_updated_at ON public.roll_calls;
CREATE TRIGGER roll_calls_updated_at
  BEFORE UPDATE ON public.roll_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_roll_calls_updated_at();

-- Staff assignments trigger
CREATE OR REPLACE FUNCTION update_staff_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_assignments_updated_at ON public.staff_assignments;
CREATE TRIGGER staff_assignments_updated_at
  BEFORE UPDATE ON public.staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_assignments_updated_at();

-- Staff tasks trigger
CREATE OR REPLACE FUNCTION update_staff_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_tasks_updated_at ON public.staff_tasks;
CREATE TRIGGER staff_tasks_updated_at
  BEFORE UPDATE ON public.staff_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_tasks_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.roll_calls IS 'Daily roll calls at 11am and 5pm to verify which dogs are present';
COMMENT ON TABLE public.staff_assignments IS 'Staff assignments to different areas/playgrounds throughout the day';
COMMENT ON TABLE public.staff_tasks IS 'Specific tasks assigned to staff members by admins';
